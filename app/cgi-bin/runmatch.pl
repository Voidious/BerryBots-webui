#!/usr/bin/perl
use CGI;
use JSON;

# For production, use something like:
#$basedir = "/home/ubuntu/berrybots";
#$wwwdir = "/var/www"

# @Voidious development:
$basedir = "/Users/pcupka/Documents/BerryBots/webui-host";
$wwwdir = "/Users/pcupka/Documents/BerryBots/webui/app";

$maxCodeLength = 512 * 1024;
$maxErrorLogLines = 120;

@stages = ('battle1.lua', 'joust.lua', 'maze1.lua', 'maze2.lua',
           'lasergallery.lua', 'vortex.lua', 'battle2.lua', 'battle3.lua',
           'randombattle.lua');
@opponents = ('chaser.lua', 'jouster.lua', 'randombot.lua', 'wallhugger.lua',
              'basicbattler.lua', 'floatingduck.lua', '<none>');

$query = new CGI;

$stage = $query->param("stage");
$opponent = $query->param("opponent");
$code = $query->param("code");

$filename = "player" . int(rand(100000000)) . ".lua";
open (OUTFILE, ">" . $basedir . "/bots/" . $filename);
print (OUTFILE $code);
close(OUTFILE);

print "Content-type: application/json\n\n";

if (!isValidStage($stage)) {
  die("Invalid stage: " . $stage . "\n");
}

if (!isValidOpponent($opponent)) {
  die("Invalid opponent: " . $opponent . "\n");
}

if (length($code) > $maxCodeLength) {
  die("Code too big: " . length($code));
}

$opponent = "sample/" . $opponent;
if ($opponent eq "sample/basicbattler.lua") {
  $opponent = "super" . $opponent;
}
if ($opponent =~ /<none>/) {
  $opponent = "";
} else {
  $opponent = " bots/" . $opponent;
}

chdir($basedir);
$s = `$basedir/berrybots stages/sample/$stage bots/$filename$opponent`;
$s =~ /\nSaved replay to: replays\/(.*)\n/;
$replayFilename = $1;
unlink($basedir . "/bots/" . $filename);

`cp $basedir/replays/$replayFilename $wwwdir/replays`;

$errorLog = getErrorLog($s);

my %replayData = ('replay' => $replayFilename, 'errorLog' => $errorLog);
$replayJson = encode_json \%replayData;

print $replayJson;

sub isValidStage {
  my $stage = $_[0];
  my $valid = 0;
  foreach my $validStage (@stages) {
    if ($stage eq $validStage) {
      $valid = 1;
      break;
    }
  }
  return $valid;
}

sub isValidOpponent {
  my $opponent = $_[0];
  my $valid = 0;
  foreach my $validOpponent (@opponents) {
    if ($opponent eq $validOpponent) {
      $valid = 1;
      break;
    }
  }
  return $valid;
}

sub getErrorLog {
  my $log = $_[0];
  $log =~ /^([\s\S]*)\nSaved replay to: replays/;
  my $errorLog = $1;
  $errorLog = "\n" . $errorLog;
  $errorLog =~ s/\nShip: [^:]+: /\n\n/g;
  $errorLog =~ s/^\s+//g;
  my @errorLines = split(/\n/, $errorLog);
  if ($#errorLines > $maxErrorLogLines) {
    my @newLogLines;
    for (my $x = 0; $x < $maxErrorLogLines; $x++) {
      $newLogLines[$x] = $errorLines[$x];
    }
    $newLogLines[$maxErrorLogLines] = "\n=== "
        . ($#errorLines - $maxErrorLogLines) . " more lines omitted ===";
    $errorLog = join("\n", @newLogLines);
  }
  return $errorLog;
}
