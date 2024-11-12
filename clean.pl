#!/usr/bin/perl
use strict;
use warnings;
use File::Find;
use File::Spec;
use Data::Dumper;

# Common patterns to ignore in Next.js projects
my @common_ignores = (
    # Next.js build output
    '.next/',
    'out/',
    'build/',
    
    # Dependencies
    'node_modules/',
    '.pnp/',
    '.pnp.js',
    
    # Environment files
    '.env*.local',
    '.env.local',
    '.env.development.local',
    '.env.test.local',
    '.env.production.local',
    
    # Debug logs
    'npm-debug.log*',
    'yarn-debug.log*',
    'yarn-error.log*',
    
    # Cache directories
    '.cache/',
    '.eslintcache',
    
    # Editor directories
    '.idea/',
    '.vscode/',
    '*.swp',
    '*.swo',
    
    # OS files
    '.DS_Store',
    'Thumbs.db',
    
    # PWA files
    'public/sw.js',
    'public/workbox-*.js',
    'public/worker-*.js',
    'public/sw.js.map',
    'public/workbox-*.js.map',
    'public/worker-*.js.map'
);

# Initialize arrays to store results
my @unused_files;
my @temp_files;
my @large_files;

# Save the current directory
my $start_dir = '.';

# Function to check if a file is potentially unused
sub check_file {
    my $file = $File::Find::name;
    my $relative_path = File::Spec->abs2rel($file, $start_dir);
    
    # Skip node_modules and .next directories
    return if $file =~ /node_modules|\.next/;
    
    # Check for temporary and backup files
    if ($file =~ /\.(tmp|temp|bak|log|old)$/) {
        push @temp_files, $relative_path;
        return;
    }
    
    # Check file size (files > 1MB)
    my $size = -s $file;
    if ($size && $size > 1_000_000) {
        push @large_files, "$relative_path (" . int($size/1024/1024) . "MB)";
    }
    
    # Check for potentially unused files
    if ($file =~ /\.(js|jsx|ts|tsx)$/) {
        # Skip if it's in pages/ or components/
        return if $file =~ /\b(pages|components|app)\b/;
        
        # Check if file might be unused
        my $is_imported = 0;
        find(sub {
            return if $_ !~ /\.(js|jsx|ts|tsx)$/;
            return if $File::Find::name eq $file;
            
            open my $fh, '<', $_ or return;
            while (<$fh>) {
                if (/$relative_path/i || /\b$relative_path\b/i) {
                    $is_imported = 1;
                    last;
                }
            }
            close $fh;
        }, $start_dir);
        
        push @unused_files, $relative_path unless $is_imported;
    }
}

# Run the analysis
print "Analyzing project structure...\n\n";
find(\&check_file, $start_dir);

# Generate .gitignore content
my @gitignore_content = (@common_ignores, @unused_files, @temp_files);

# Print results
print "Potentially unused files:\n";
print "- $_\n" for @unused_files;
print "\nTemporary/backup files:\n";
print "- $_\n" for @temp_files;
print "\nLarge files (>1MB):\n";
print "- $_\n" for @large_files;

# Write to .gitignore
print "\nGenerating .gitignore file...\n";
open my $gi, '>', '.gitignore' or die "Cannot open .gitignore: $!";
print $gi "$_\n" for @gitignore_content;
close $gi;

print "\nDone! .gitignore has been updated.\n";
