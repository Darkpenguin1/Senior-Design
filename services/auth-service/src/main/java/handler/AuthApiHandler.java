package handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import org.mindrot.jbcrypt.BCrypt;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;
import software.amazon.awssdk.services.dynamodb.model.QueryRequest;
import software.amazon.awssdk.services.dynamodb.model.QueryResponse;

import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * HTTP API handler for signup and login. Routes:
 *   POST /auth/signup  -> { email, password, role } -> { token, role, user_id }
 *   POST /auth/login   -> { email, password }       -> { token, role, user_id }
 *
 * Passwords are bcrypt-hashed, JWTs are HS256-signed with JWT_SECRET.
 * Users are stored in the DynamoDB table named by USERS_TABLE with a GSI
 * "email-index" on the email attribute.
 */
public class AuthApiHandler implements RequestHandler<APIGatewayV2HTTPEvent, APIGatewayV2HTTPResponse> {

    private static final DynamoDbClient DDB = DynamoDbClient.create();
    private static final String TABLE = System.getenv("USERS_TABLE");
    private static final String JWT_SECRET = System.getenv("JWT_SECRET");
    private static final String ISSUER = "pickfix-auth";
    private static final Set<String> VALID_ROLES = Set.of("student", "contractor", "management");

    private static final Map<String, String> CORS_HEADERS = Map.of(
        "Access-Control-Allow-Origin", "*",
        "Access-Control-Allow-Methods", "POST,OPTIONS",
        "Access-Control-Allow-Headers", "Content-Type,Authorization",
        "Content-Type", "application/json"
    );

    @Override
    public APIGatewayV2HTTPResponse handleRequest(APIGatewayV2HTTPEvent event, Context context) {
        String method = event.getRequestContext().getHttp().getMethod();
        String path = event.getRequestContext().getHttp().getPath();

        if ("OPTIONS".equalsIgnoreCase(method)) {
            return respond(204, "");
        }

        try {
            if ("POST".equalsIgnoreCase(method) && path.endsWith("/auth/signup")) {
                return signup(event.getBody());
            }
            if ("POST".equalsIgnoreCase(method) && path.endsWith("/auth/login")) {
                return login(event.getBody());
            }
            return respond(404, "{\"error\":\"not found\"}");
        } catch (Exception e) {
            context.getLogger().log("auth error: " + e.getMessage());
            return respond(500, "{\"error\":\"internal error\"}");
        }
    }

    private APIGatewayV2HTTPResponse signup(String body) {
        Map<String, String> in = parseJson(body);
        String email = in.get("email");
        String password = in.get("password");
        String role = in.get("role");

        if (email == null || password == null || role == null) {
            return respond(400, "{\"error\":\"email, password, role required\"}");
        }
        if (!VALID_ROLES.contains(role)) {
            return respond(400, "{\"error\":\"invalid role\"}");
        }

        if (findByEmail(email) != null) {
            return respond(409, "{\"error\":\"email already registered\"}");
        }

        String userId = UUID.randomUUID().toString();
        String hash = BCrypt.hashpw(password, BCrypt.gensalt(10));

        Map<String, AttributeValue> item = new HashMap<>();
        item.put("user_id", AttributeValue.fromS(userId));
        item.put("email", AttributeValue.fromS(email));
        item.put("password_hash", AttributeValue.fromS(hash));
        item.put("role", AttributeValue.fromS(role));
        item.put("createdAt", AttributeValue.fromS(Instant.now().toString()));

        DDB.putItem(PutItemRequest.builder().tableName(TABLE).item(item).build());

        String token = issueToken(userId, email, role);
        return respond(200, tokenBody(token, role, userId));
    }

    private APIGatewayV2HTTPResponse login(String body) {
        Map<String, String> in = parseJson(body);
        String email = in.get("email");
        String password = in.get("password");

        if (email == null || password == null) {
            return respond(400, "{\"error\":\"email and password required\"}");
        }

        Map<String, AttributeValue> user = findByEmail(email);
        if (user == null) {
            return respond(401, "{\"error\":\"invalid credentials\"}");
        }

        String hash = user.get("password_hash").s();
        if (!BCrypt.checkpw(password, hash)) {
            return respond(401, "{\"error\":\"invalid credentials\"}");
        }

        String userId = user.get("user_id").s();
        String role = user.get("role").s();
        String token = issueToken(userId, email, role);
        return respond(200, tokenBody(token, role, userId));
    }

    private Map<String, AttributeValue> findByEmail(String email) {
        QueryRequest req = QueryRequest.builder()
            .tableName(TABLE)
            .indexName("email-index")
            .keyConditionExpression("email = :e")
            .expressionAttributeValues(Map.of(":e", AttributeValue.fromS(email)))
            .limit(1)
            .build();
        QueryResponse resp = DDB.query(req);
        return resp.items().isEmpty() ? null : resp.items().get(0);
    }

    private String issueToken(String userId, String email, String role) {
        Instant now = Instant.now();
        return JWT.create()
            .withIssuer(ISSUER)
            .withSubject(userId)
            .withClaim("role", role)
            .withClaim("email", email)
            .withIssuedAt(Date.from(now))
            .withExpiresAt(Date.from(now.plusSeconds(86400)))
            .sign(Algorithm.HMAC256(JWT_SECRET));
    }

    private String tokenBody(String token, String role, String userId) {
        return "{\"token\":\"" + escape(token) + "\",\"role\":\"" + escape(role)
            + "\",\"user_id\":\"" + escape(userId) + "\"}";
    }

    private APIGatewayV2HTTPResponse respond(int status, String body) {
        return APIGatewayV2HTTPResponse.builder()
            .withStatusCode(status)
            .withHeaders(CORS_HEADERS)
            .withBody(body)
            .build();
    }

    /**
     * Minimal JSON object parser sufficient for flat {"k":"v",...} bodies with
     * string values. Avoids pulling in a JSON library for three fields.
     */
    private static Map<String, String> parseJson(String body) {
        Map<String, String> out = new HashMap<>();
        if (body == null) return out;
        String s = body.trim();
        if (s.startsWith("{")) s = s.substring(1);
        if (s.endsWith("}")) s = s.substring(0, s.length() - 1);
        int i = 0;
        while (i < s.length()) {
            int k1 = s.indexOf('"', i);
            if (k1 < 0) break;
            int k2 = s.indexOf('"', k1 + 1);
            if (k2 < 0) break;
            String key = s.substring(k1 + 1, k2);
            int colon = s.indexOf(':', k2 + 1);
            if (colon < 0) break;
            int v1 = s.indexOf('"', colon + 1);
            if (v1 < 0) break;
            int v2 = v1 + 1;
            StringBuilder val = new StringBuilder();
            while (v2 < s.length()) {
                char c = s.charAt(v2);
                if (c == '\\' && v2 + 1 < s.length()) {
                    val.append(s.charAt(v2 + 1));
                    v2 += 2;
                    continue;
                }
                if (c == '"') break;
                val.append(c);
                v2++;
            }
            out.put(key, val.toString());
            i = v2 + 1;
        }
        return out;
    }

    private static String escape(String s) {
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
