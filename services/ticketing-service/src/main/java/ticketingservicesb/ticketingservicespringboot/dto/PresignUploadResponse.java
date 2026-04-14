package ticketingservicesb.ticketingservicespringboot.dto;

public class PresignUploadResponse {
    private String uploadUrl;
    private String key;
    private String cdnUrl;
    private long expiresIn;

    public PresignUploadResponse(String uploadUrl, String key, String cdnUrl, long expiresIn) {
        this.uploadUrl = uploadUrl;
        this.key = key;
        this.cdnUrl = cdnUrl;
        this.expiresIn = expiresIn;
    }

    // getters
    public String getUploadURL(){
        return uploadUrl;
    }

    public void setContentType(String uploadURL){
        this.uploadUrl = uploadURL;
    }

    public String getKey(){
        return key;
    }

    public void setKey(String key){
        this.key = key;
    }

    public String getCdnURL(){
        return cdnUrl;
    }

    public void setCdnURL(String cdnUrl){
        this.cdnUrl = cdnUrl;
    }

    public long expiresIn(){
        return expiresIn;
    }

    public void getExpiresIn(long expiresIn){
        this.expiresIn = expiresIn;
    }


   
    
}