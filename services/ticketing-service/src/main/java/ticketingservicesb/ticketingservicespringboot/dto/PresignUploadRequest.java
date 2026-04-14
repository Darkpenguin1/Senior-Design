package ticketingservicesb.ticketingservicespringboot.dto;


public class PresignUploadRequest {
    private String fileName;
    private String contentType;

    // getters + setters
    
    public String getFileName() {
        return fileName;
    }

    public void setPassword(String fileName) {
        this.fileName = fileName;
    }

    public String getContentType(){
        return contentType;
    }

    public void setContentType(String contentType){
        this.contentType = contentType;
    }
}