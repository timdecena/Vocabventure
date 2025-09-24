# Island 2 (Waterside Shores) Implementation Plan

## Database Recommendations

### Option A: Standardized Approach (RECOMMENDED)

**Benefits:**
- Single table for all islands
- Easier to maintain and extend
- Consistent data structure
- Better scalability

**Required Changes:**

1. **Create new `island_progress` table:**
```sql
CREATE TABLE island_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    island_name VARCHAR(255) NOT NULL,
    completed_level INT NOT NULL DEFAULT 0,
    total_stars INT NOT NULL DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_user_island (user_id, island_name)
);
```

2. **Migrate existing jungle_lush_progress data:**
```sql
INSERT INTO island_progress (user_id, island_name, completed_level, total_stars)
SELECT user_id, island_name, completed_level, 0 as total_stars
FROM jungle_lush_progress;
```

3. **Drop old table:**
```sql
DROP TABLE jungle_lush_progress;
```

### Option B: Island-Specific Tables (Current Approach)

**Required Changes:**

1. **Create `waterside_shores_progress` table:**
```sql
CREATE TABLE waterside_shores_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    island_name VARCHAR(255) NOT NULL,
    completed_level INT NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Backend Code Changes

### For Option A (Recommended):

1. **Create new entity:**
```java
@Entity
@Table(name = "island_progress")
public class IslandProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @Column(name = "island_name", nullable = false)
    private String islandName;
    
    @Column(name = "completed_level", nullable = false)
    private int completedLevel = 0;
    
    @Column(name = "total_stars", nullable = false)
    private int totalStars = 0;
    
    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;
    
    // Getters and setters
}
```

2. **Create repository:**
```java
@Repository
public interface IslandProgressRepository extends JpaRepository<IslandProgress, Long> {
    List<IslandProgress> findByUser(User user);
    Optional<IslandProgress> findByUserAndIslandName(User user, String islandName);
}
```

3. **Create service:**
```java
@Service
public class IslandProgressService {
    // Methods to handle all islands generically
    public void updateProgress(String email, String islandName, int completedLevel, int starsEarned);
    public List<IslandProgressDTO> getProgressForUser(String email);
    public IslandProgressDTO getProgressForIsland(String email, String islandName);
}
```

4. **Update controller:**
```java
@RestController
@RequestMapping("/api/adventure/island-progress")
public class IslandProgressController {
    @PostMapping("/{islandName}/update")
    public void updateProgress(@PathVariable String islandName, @RequestBody IslandProgressDTO dto, Principal principal);
    
    @GetMapping
    public List<IslandProgressDTO> getAllProgress(Principal principal);
    
    @GetMapping("/{islandName}")
    public IslandProgressDTO getIslandProgress(@PathVariable String islandName, Principal principal);
}
```

### For Option B:

1. **Create WatersideShoresProgress entity** (similar to JungleLushProgress)
2. **Create WatersideShoresProgressService**
3. **Create WatersideShoresProgressController**

## Frontend Changes Required

### Update API calls in level components:

**Current (Jungle Lush):**
```javascript
await axios.post('/api/adventure/level-progress/save', {
  levelName: "Level Name",
  completed: true,
  starsEarned: hearts
});
```

**New (For Option A):**
```javascript
await axios.post('/api/adventure/island-progress/waterside-shores/update', {
  completedLevel: levelNumber,
  starsEarned: hearts
});
```

## Recommendation Summary

**I strongly recommend Option A** because:
1. ✅ Single source of truth for all islands
2. ✅ Easier to add new islands in the future
3. ✅ Better data consistency
4. ✅ Simpler maintenance
5. ✅ More scalable architecture

**Next Steps:**
1. Choose your preferred option
2. I'll help you implement the database changes
3. Update the backend code accordingly
4. Modify frontend API calls
5. Test the implementation

Which option would you prefer to implement?
