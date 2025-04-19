package com.backend.VocabVenture.util;

import java.time.Duration;
import java.time.LocalDateTime;

public class GameTimer {
    public static long getDurationInSeconds(LocalDateTime start, LocalDateTime end) {
        return Duration.between(start, end).getSeconds();
    }
}
