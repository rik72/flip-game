#!/bin/bash

# Script to manage levels - insert placeholder levels or delete existing levels
# Usage: ./manage_levels.sh <pos> [<n>]
#   pos: position to insert/delete levels (1-based)
#   n: number of levels to insert (positive) or delete (negative)
#       If n is positive: insert n placeholder levels starting at pos
#       If n is negative: delete |n| levels starting at pos (move to *_del.json)
#       If n is omitted: insert 1 placeholder level

set -e  # Exit on any error

# Check arguments
if [ $# -lt 1 ] || [ $# -gt 2 ]; then
    echo "Usage: $0 <pos> [<n>]"
    echo "  pos: position to insert/delete levels (1-based)"
    echo "  n: number of levels to insert (positive) or delete (negative)"
    echo "     If n is positive: insert n placeholder levels starting at pos"
    echo "     If n is negative: delete |n| levels starting at pos (move to *_del.json)"
    echo "     If n is omitted: insert 1 placeholder level"
    exit 1
fi

POS=$1
N=${2:-1}  # Default to 1 if not provided

# Validate inputs
if ! [[ "$POS" =~ ^[0-9]+$ ]] || [ "$POS" -lt 1 ]; then
    echo "Error: Position must be a positive integer"
    exit 1
fi

if ! [[ "$N" =~ ^-?[0-9]+$ ]] || [ "$N" -eq 0 ]; then
    echo "Error: Number of levels must be a non-zero integer (positive for insert, negative for delete)"
    exit 1
fi

# Find the highest level number
HIGHEST_LEVEL=0
for file in levels/level_*.json; do
    if [ -f "$file" ]; then
        level_num=$(basename "$file" .json | sed 's/level_//')
        if [ "$level_num" -gt "$HIGHEST_LEVEL" ]; then
            HIGHEST_LEVEL=$level_num
        fi
    fi
done

echo "Found highest level: $HIGHEST_LEVEL"

# Handle deletion (negative N)
if [ "$N" -lt 0 ]; then
    N_ABS=$((N * -1))  # Absolute value of N
    echo "Deleting $N_ABS level(s) starting at position $POS"
    
    # Check if deletion range is valid
    if [ "$POS" -gt "$HIGHEST_LEVEL" ]; then
        echo "Error: Position $POS is beyond the highest level ($HIGHEST_LEVEL)"
        exit 1
    fi
    
    END_POS=$((POS + N_ABS - 1))
    if [ "$END_POS" -gt "$HIGHEST_LEVEL" ]; then
        echo "Error: Deletion range $POS to $END_POS exceeds highest level ($HIGHEST_LEVEL)"
        exit 1
    fi
    
    # Move levels to be deleted to *_del.json files
    for ((i=POS; i<=END_POS; i++)); do
        old_file="levels/level_${i}.json"
        del_file="levels/level_${i}_del.json"
        
        if [ -f "$old_file" ]; then
            echo "Moving level $i to $del_file"
            mv "$old_file" "$del_file"
        fi
    done
    
    # Renumber remaining levels to fill gaps
    # Start from the level after the deletion range
    for ((i=END_POS+1; i<=HIGHEST_LEVEL; i++)); do
        old_file="levels/level_${i}.json"
        new_level=$((i - N_ABS))
        new_file="levels/level_${new_level}.json"
        
        if [ -f "$old_file" ]; then
            echo "Moving level $i to level $new_level"
            
            # Update the level number in the JSON content
            sed "s/\"level\": $i/\"level\": $new_level/" "$old_file" > "$new_file"
            rm "$old_file"
        fi
    done
    
    echo "Successfully deleted $N_ABS level(s) starting at position $POS"
    echo "Deleted levels moved to *_del.json files"
    echo "Remaining levels renumbered to fill gaps"
    exit 0
fi

# Handle insertion (positive N)
echo "Inserting $N placeholder level(s) at position $POS"

# Check if position is valid
if [ "$POS" -gt $((HIGHEST_LEVEL + 1)) ]; then
    echo "Error: Position $POS is beyond the highest level ($HIGHEST_LEVEL)"
    exit 1
fi

# Create placeholder level content
create_placeholder_level() {
    local level_num=$1
    cat << EOF
{
    "level": $level_num,
    "board": {
        "front": [
            "__ __ __ __ __",
            "__ p0 p0 p0 __",
            "__ __ __ __ __"
        ]
    },
    "balls": [
        {
            "start": [1, 1],
            "end": [3, 1],
            "color": "red"
        }
    ]
}
EOF
}

# Move existing levels to make room for new ones
# Start from the highest level and work backwards
for ((i=HIGHEST_LEVEL; i>=POS; i--)); do
    old_file="levels/level_${i}.json"
    new_file="levels/level_$((i+N)).json"
    
    if [ -f "$old_file" ]; then
        echo "Moving level $i to level $((i+N))"
        
        # Update the level number in the JSON content
        if [ "$i" -ge "$POS" ]; then
            # For levels that need to be moved, update their level number
            sed "s/\"level\": $i/\"level\": $((i+N))/" "$old_file" > "$new_file"
        else
            # For levels that don't need to be moved, just copy
            cp "$old_file" "$new_file"
        fi
        
        # Remove the old file if it was moved (not copied)
        if [ "$i" -ge "$POS" ]; then
            rm "$old_file"
        fi
    fi
done

# Create the new placeholder levels
for ((i=0; i<N; i++)); do
    level_num=$((POS + i))
    new_file="levels/level_${level_num}.json"
    
    echo "Creating placeholder level $level_num"
    create_placeholder_level "$level_num" > "$new_file"
done

echo "Successfully inserted $N placeholder level(s) at position $POS"
echo "Levels $POS through $((POS+N-1)) are now placeholder levels"
echo "All subsequent levels have been shifted by $N positions" 