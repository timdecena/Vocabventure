# Character Positioning Guide

## How to Adjust Character Positions

All character positions are now defined in the `CHARACTER_POSITIONS` object at the top of `JungleLushLevel2.jsx`. You can easily adjust these values to fix positioning issues:

```javascript
const CHARACTER_POSITIONS = {
  // Dialogue phase positioning
  WIZARD_LEFT: '100px',                // Wizard position from left edge
  WIZARD_BOTTOM: '100px',              // Wizard height from bottom
  ADVENTURER_LEFT: '180px',            // Adventurer position from left edge  
  ADVENTURER_BOTTOM: '5px',            // Adventurer height from bottom
  
  // Dialogue scene positioning - separate for each monster
  DIALOGUE_ORC_RIGHT: '50px',          // Orc position in dialogue from right edge
  DIALOGUE_ORC_BOTTOM: '130px',        // ⭐ ADJUST THIS for Orc in dialogue
  DIALOGUE_TENSAPHANT_RIGHT: '50px',   // Tensaphant position in dialogue from right edge
  DIALOGUE_TENSAPHANT_BOTTOM: '120px', // ⭐ ADJUST THIS for Tensaphant in dialogue
  
  // Battle phase positioning
  BATTLE_ADVENTURER_LEFT: '500px',     // Adventurer position in battle
  BATTLE_ADVENTURER_BOTTOM: '120px',   // Adventurer height in battle
  BATTLE_ORC_RIGHT: '420px',           // Orc position from right edge
  BATTLE_ORC_BOTTOM: '90px',           // ⭐ ADJUST THIS for Orc in battle
  BATTLE_TENSAPHANT_RIGHT: '420px',    // Tensaphant position from right edge  
  BATTLE_TENSAPHANT_BOTTOM: '90px',    // ⭐ ADJUST THIS for Tensaphant in battle
};
```

## Quick Fixes

### To fix Orc floating in DIALOGUE:
- Increase `DIALOGUE_ORC_BOTTOM` value (try 140px, 150px, 160px)

### To fix Orc floating in BATTLE:
- Increase `BATTLE_ORC_BOTTOM` value (try 120px, 130px, 140px)

### To adjust Tensaphant position in DIALOGUE:
- Modify `DIALOGUE_TENSAPHANT_BOTTOM` and `DIALOGUE_TENSAPHANT_RIGHT` independently

### To adjust Tensaphant position in BATTLE:
- Modify `BATTLE_TENSAPHANT_BOTTOM` and `BATTLE_TENSAPHANT_RIGHT` independently

### Platform reference:
- Ground platform is at 90px bottom
- Characters should typically be positioned at 120px+ to appear on the platform

## Features Implemented

✅ **Separate positioning for each monster type**
✅ **Easy-to-modify constants at top of file**  
✅ **Tensaphant sprites with attack, hurt, death animations**
✅ **Both monsters face adventurer when hurt**
✅ **Adventurer attack animation on correct answers** 