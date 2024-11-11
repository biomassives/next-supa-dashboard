#!/bin/bash

output_file="concatenated_output.sql"
> "$output_file"

# Find all .sql files in the subdirectories and concatenate them
find . -maxdepth 2 -name "*.sql" -print0 | xargs -0 cat >> "$output_file"

echo "Concatenation complete. Output written to: $output_file"
