---
title: Snakemake 性能分析
description: Snakemake 流程管理和性能分析
---

## 1. Prerequisites

### Install Snakemake

Snakemake is primarily used on Linux, but also supports macOS and Windows (via WSL).

#### Linux / macOS

```bash
# Using pip
pip install snakemake

# Using conda (recommended for reproducibility)
conda install -c conda-forge snakemake
```

#### Windows

Snakemake is not natively supported on Windows. Use **WSL (Windows Subsystem for Linux)**:

1.  Install WSL:

    ```powershell
    wsl --install
    ```

2.  Install Snakemake inside WSL:

    ```bash
    pip install snakemake
    # or
    conda install -c conda-forge snakemake
    ```

### Install Perl (for benchmark script)

The benchmark summary script requires Perl, which is pre-installed on most Unix systems.

#### Linux

```bash
# Debian / Ubuntu
sudo apt install perl

# CentOS / RHEL
sudo yum install perl
```

#### macOS

Perl is pre-installed on macOS. If needed, you can install via Homebrew:

```bash
brew install perl
```

#### Windows (WSL)

Perl is included in most WSL distributions. If not:

```bash
sudo apt install perl
```

## 2. Usage

This script finds files matching `*.benchmark` and summarizes their metrics:
1.  **Total Execution Time**
2.  **Total I/O (Input/Output)**
3.  **Maximum Memory Consumption (Max RSS)**

### Example

```bash
# Summarize benchmarks in a specific directory
❯ workflow/scripts/sum_benchmark.pl benchmark/01.QC
Finding file(s) named "*.benchmark" under benchmark/01.QC and summarizing...
Total Execution Time: 02 hours 38 minutes 11 seconds
Total I/O In: 182.58G, Total I/O Out: 43.28G, Total I/O: 225.86G
Max_rss: 2.09G

# Summarize benchmarks in the current directory (default)
❯ workflow/scripts/sum_benchmark.pl
Finding file(s) named "*.benchmark" under current workdir and summarizing...
Total Execution Time: 10 hours 04 minutes 44 seconds
Total I/O In: 315.35G, Total I/O Out: 178.44G, Total I/O: 493.80G
Max_rss: 21.00G
```

:::note
- By default, Snakemake benchmark files are expected to be named `*.benchmark`. You can modify the script if your naming convention differs.
- It is recommended to check the list of input benchmark files to ensure accuracy.
:::

## 3. Source Code

Save the following code as `sum_benchmark.pl` and make it executable (`chmod +x sum_benchmark.pl`).

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
	printf ("Total Execution Time: %02d hours %02d minutes %02d seconds\n",(gmtime($total_sec))[2,1,0]);
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
