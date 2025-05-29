package com.example.Vocabia.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when there's an issue with game progress operations.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class GameProgressException extends RuntimeException {
    public GameProgressException(String message) {
        super(message);
    }

    public GameProgressException(String message, Throwable cause) {
        super(message, cause);
    }
}
