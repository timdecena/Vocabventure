package com.backend.VocabVenture.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class BadRequestException extends CustomException {
    private static final long serialVersionUID = 1L;

    public BadRequestException(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
