package com.backend.VocabVenture.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class CustomException extends RuntimeException {
    private final HttpStatus status;
    private final String message;

    public CustomException(String message, HttpStatus status) {
        super(message);
        this.message = message;
        this.status = status;
    }
    
    @Override
    public String getMessage() {
        return message;
    }
    
    public HttpStatus getStatus() {
        return status;
    }
}
