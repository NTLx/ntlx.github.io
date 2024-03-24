# Snakemake Benchmark Summarizing

## Usage

This script will find file(s) which name match `*.benchmark` for summarize:
1. Sum time
2. Sum I/O
3. Find Max memory consumption

For example:

```bash
❯ workflow/scripts/sum_benchmark.pl benchmark/01.QC
Finding file(s) named "*.benchmark" under benchmark/01.QC and summarizing...
Total Execution time: 02 hours 38 minutes 11 seconds
Total io_in: 182.58G, Total io_out: 43.28G, Total io: 225.86G
Max_rss: 2.09G
❯ workflow/scripts/sum_benchmark.pl
Finding file(s) named "*.benchmark" under current workdir and summarizing...
Total Execution time: 10 hours 04 minutes 44 seconds
Total io_in: 315.35G, Total io_out: 178.44G, Total io: 493.80G
Max_rss: 21.00G
```

> - As you can see, the benchmark file of Snakemake was named `*.benchmark` by default (for me), so you can modify the script to fit your own workflow.
> - Further more, checking input benchmark file list was suggested.

## Source

```perl
#!/usr/bin/perl
use strict;
use warnings;

my $path=$ARGV[0];
$path||=".";

if (!$ARGV[0]) { print "Finding file(s) named \"*.benchmark\" under current workdir and summarizing...\n"; }
else { print "Finding file(s) named \"*.benchmark\" under $path and summarizing...\n"; }

my ($total_sec,$io_in,$io_out,$max_rss)=(0,0,0,0);
my $files=`find $path -name "*.benchmark"`;
chomp($files);
my @lines=split(/\n/,$files);
foreach my $file (@lines) {
	open(IN,$file);
	while (<IN>) {
		if ($_ !~ /^s/) {
			my @arr=split/\t/;
			if ($arr[0] =~ /[0-9]/) { $total_sec+=$arr[0]; }
			if ($arr[6] =~ /[0-9]/) { $io_in+=$arr[6]; }
			if ($arr[7] =~ /[0-9]/) { $io_out+=$arr[7]; }
			if ($arr[2] =~ /[0-9]/) {
				if ($arr[2] > $max_rss) { $max_rss=$arr[2]; }
			}
		}
	}
	close IN;
}

my $total_io=$io_in+$io_out;
$io_in=&unit($io_in);
$io_out=&unit($io_out);
$total_io=&unit($total_io);
$max_rss=&unit($max_rss);

if ($total_sec) {
	printf ("Total Executed Time: %02d hours %02d minutes %02d seconds\n",(gmtime($total_sec))[2,1,0]);
	print "Total I/O In: $io_in, Total I/O Out: $io_out, Total I/O: $total_io\n";
	print "Max_rss: $max_rss\n";
}
else { print "Maybe there was no \"*.benchmark\" file?\n"; }

sub unit {
	my $input=shift;
	my $value;
	if($input >= 1024000 ) {
		$value=sprintf("%.2f",($input/1024000) )."T";
	} elsif ($input >= 1024 ) {
		$value=sprintf("%.2f",($input/1024) )."G";
	} else {
		$value=sprintf("%.2f",$input)."M";
	}
	return($value);
}
```