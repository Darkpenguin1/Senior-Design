package handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;

public class Handler implements RequestHandler<String, String> {

    @Override
    public String handleRequest(String input, Context context) {

        System.out.println("Running CI version 1.0");
        context.getLogger().log("Received: " + input);
        return "Processed: " + input;
    }
}



