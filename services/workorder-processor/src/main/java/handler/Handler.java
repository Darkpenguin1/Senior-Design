package handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import software.amazon.awssdk.services.secretsmanager.SecretsManagerClient;
import software.amazon.awssdk.services.secretsmanager.model.GetSecretValueRequest;

import java.sql.*;
import java.util.HashMap;
import java.util.Map;

public class Handler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    private static final Gson gson = new Gson();

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent request, Context context) {
        try {
            String method = request.getHttpMethod();
            String path = request.getPath();

            context.getLogger().log("HTTP Method: " + method + "\n");
            context.getLogger().log("Path: " + path + "\n");

            if ("POST".equalsIgnoreCase(method) && "/tickets".equals(path)) {
                return createTicket(request, context);
            }

            if ("GET".equalsIgnoreCase(method) && "/tickets".equals(path)) {
                return getAllTickets(context);
            }

            if ("GET".equalsIgnoreCase(method) && path != null && path.startsWith("/tickets/")) {
                return getTicketById(request, context);
            }

            if ("PUT".equalsIgnoreCase(method) && path != null && path.startsWith("/tickets/")) {
                return updateTicket(request, context);
            }

            return response(404, jsonMessage("Route not found"));
        } catch (Exception e) {
            context.getLogger().log("ERROR: " + e.getMessage() + "\n");
            return response(500, jsonMessage("Internal server error: " + e.getMessage()));
        }
    }

    private APIGatewayProxyResponseEvent createTicket(APIGatewayProxyRequestEvent request, Context context) {
        try (Connection conn = getConnection()) {
            JsonObject body = JsonParser.parseString(request.getBody()).getAsJsonObject();

            String title = getRequiredString(body, "title");
            String description = getOptionalString(body, "description");
            String priority = getOptionalString(body, "priority");
            String createdBy = getOptionalString(body, "created_by");

            if (priority == null || priority.isBlank()) {
                priority = "MEDIUM";
            }

            String sql = """
                INSERT INTO tickets (title, description, priority, created_by)
                VALUES (?, ?, ?, ?)
                RETURNING id, title, description, status, priority, created_by, assigned_to, created_at, updated_at
            """;

            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, title);
                stmt.setString(2, description);
                stmt.setString(3, priority);
                stmt.setString(4, createdBy);

                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        Map<String, Object> ticket = mapTicket(rs);
                        return response(201, gson.toJson(ticket));
                    }
                }
            }

            return response(500, jsonMessage("Failed to create ticket"));
        } catch (IllegalArgumentException e) {
            return response(400, jsonMessage(e.getMessage()));
        } catch (Exception e) {
            context.getLogger().log("CREATE ERROR: " + e.getMessage() + "\n");
            return response(500, jsonMessage("Create failed: " + e.getMessage()));
        }
    }

    private APIGatewayProxyResponseEvent getAllTickets(Context context) {
        try (Connection conn = getConnection()) {
            String sql = """
                SELECT id, title, description, status, priority, created_by, assigned_to, created_at, updated_at
                FROM tickets
                ORDER BY created_at DESC
            """;

            try (PreparedStatement stmt = conn.prepareStatement(sql);
                 ResultSet rs = stmt.executeQuery()) {

                java.util.List<Map<String, Object>> tickets = new java.util.ArrayList<>();

                while (rs.next()) {
                    tickets.add(mapTicket(rs));
                }

                return response(200, gson.toJson(tickets));
            }
        } catch (Exception e) {
            context.getLogger().log("GET ALL ERROR: " + e.getMessage() + "\n");
            return response(500, jsonMessage("Get all tickets failed: " + e.getMessage()));
        }
    }

    private APIGatewayProxyResponseEvent getTicketById(APIGatewayProxyRequestEvent request, Context context) {
        try (Connection conn = getConnection()) {
            String id = extractIdFromPath(request.getPath());

            String sql = """
                SELECT id, title, description, status, priority, created_by, assigned_to, created_at, updated_at
                FROM tickets
                WHERE id = ?::uuid
            """;

            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, id);

                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        Map<String, Object> ticket = mapTicket(rs);
                        return response(200, gson.toJson(ticket));
                    } else {
                        return response(404, jsonMessage("Ticket not found"));
                    }
                }
            }
        } catch (IllegalArgumentException e) {
            return response(400, jsonMessage(e.getMessage()));
        } catch (Exception e) {
            context.getLogger().log("GET ERROR: " + e.getMessage() + "\n");
            return response(500, jsonMessage("Get failed: " + e.getMessage()));
        }
    }

    private APIGatewayProxyResponseEvent updateTicket(APIGatewayProxyRequestEvent request, Context context) {
        try (Connection conn = getConnection()) {
            String id = extractIdFromPath(request.getPath());
            JsonObject body = JsonParser.parseString(request.getBody()).getAsJsonObject();

            String description = getOptionalString(body, "description");
            String status = getOptionalString(body, "status");
            String priority = getOptionalString(body, "priority");
            String assignedTo = getOptionalString(body, "assigned_to");

            String sql = """
                UPDATE tickets
                SET description = COALESCE(?, description),
                    status = COALESCE(?, status),
                    priority = COALESCE(?, priority),
                    assigned_to = COALESCE(?, assigned_to),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?::uuid
                RETURNING id, title, description, status, priority, created_by, assigned_to, created_at, updated_at
            """;

            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, description);
                stmt.setString(2, status);
                stmt.setString(3, priority);
                stmt.setString(4, assignedTo);
                stmt.setString(5, id);

                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        Map<String, Object> ticket = mapTicket(rs);
                        return response(200, gson.toJson(ticket));
                    } else {
                        return response(404, jsonMessage("Ticket not found"));
                    }
                }
            }
        } catch (IllegalArgumentException e) {
            return response(400, jsonMessage(e.getMessage()));
        } catch (Exception e) {
            context.getLogger().log("UPDATE ERROR: " + e.getMessage() + "\n");
            return response(500, jsonMessage("Update failed: " + e.getMessage()));
        }
    }

    private Connection getConnection() throws Exception {
        String secretName = System.getenv("SECRET_NAME");
        String dbHost = System.getenv("DB_HOST");
        String dbPort = System.getenv("DB_PORT");
        String dbName = System.getenv("DB_NAME");

        if (secretName == null || secretName.isBlank()) {
            throw new RuntimeException("Missing SECRET_NAME environment variable.");
        }

        if (dbHost == null || dbHost.isBlank() ||
            dbPort == null || dbPort.isBlank() ||
            dbName == null || dbName.isBlank()) {
            throw new RuntimeException("Missing DB_HOST, DB_PORT, or DB_NAME environment variables.");
        }

        SecretsManagerClient client = SecretsManagerClient.builder().build();

        GetSecretValueRequest getSecretValueRequest = GetSecretValueRequest.builder()
                .secretId(secretName)
                .build();

        String secret = client.getSecretValue(getSecretValueRequest).secretString();

        JsonObject secretJson = JsonParser.parseString(secret).getAsJsonObject();

        String username = secretJson.get("username").getAsString();
        String password = secretJson.get("password").getAsString();

        String jdbcUrl = "jdbc:postgresql://" + dbHost + ":" + dbPort + "/" + dbName;

        return DriverManager.getConnection(jdbcUrl, username, password);
    }

    private String extractIdFromPath(String path) {
        if (path == null || !path.startsWith("/tickets/")) {
            throw new IllegalArgumentException("Invalid ticket path");
        }

        String id = path.substring("/tickets/".length()).trim();

        if (id.isBlank()) {
            throw new IllegalArgumentException("Missing ticket id in path");
        }

        return id;
    }

    private String getRequiredString(JsonObject body, String key) {
        String value = getOptionalString(body, key);
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Missing required field: " + key);
        }
        return value;
    }

    private String getOptionalString(JsonObject body, String key) {
        if (body == null || !body.has(key) || body.get(key).isJsonNull()) {
            return null;
        }
        return body.get(key).getAsString();
    }

    private Map<String, Object> mapTicket(ResultSet rs) throws SQLException {
        Map<String, Object> ticket = new HashMap<>();
        ticket.put("id", rs.getString("id"));
        ticket.put("title", rs.getString("title"));
        ticket.put("description", rs.getString("description"));
        ticket.put("status", rs.getString("status"));
        ticket.put("priority", rs.getString("priority"));
        ticket.put("created_by", rs.getString("created_by"));
        ticket.put("assigned_to", rs.getString("assigned_to"));
        ticket.put("created_at", rs.getString("created_at"));
        ticket.put("updated_at", rs.getString("updated_at"));
        return ticket;
    }

    private APIGatewayProxyResponseEvent response(int statusCode, String body) {
        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");

        return new APIGatewayProxyResponseEvent()
                .withStatusCode(statusCode)
                .withHeaders(headers)
                .withBody(body);
    }

    private String jsonMessage(String message) {
        Map<String, String> body = new HashMap<>();
        body.put("message", message);
        return gson.toJson(body);
    }
}