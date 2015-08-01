#!/usr/bin/perl
use CGI;

$basedir = "/home/ubuntu/leaguebots";
$maxCodeLength = 512 * 1024;
$maxNameLength = $maxEmailLength = 1024;

$query = new CGI;
$authorName = $query->param("name");
$authorEmail = $query->param("email");
$code = $query->param("code");
$success = "true";
$message = "All systems go!";

$botFilename = "";
$authorFilename = "";
do {
  $i = int(rand(100000000));
  $botFilename = $basedir . "/" . $i . "_bot.lua";
  $authorFilename = $basedir . "/" . $i . "_author.txt";
} while (-e $botFilename);

# We could also have locking, but if I get 100 entrants over a month, I'll be
# stoked. I'll take a gamble at P(clash) = P(concurrency) * 0.000001.

print "Content-type: text/html\n\n";

if (length($code) > $maxCodeLength) {
  $success = "false";
  $message = "Whoah, that's way too much code! (" . length($code) . " chars)\n";
} elsif (length($authorName) > $maxNameLength) {
  $success = "false";
  $message = "Whoah, your name is way too long! (" . length($authorName)
      . " chars)\n";
} elsif (length($authorEmail) > $maxEmailLength) {
  $success = "false";
  $message = "Whoah, your email is way too long! (" . length($authorEmail)
      . " chars)\n";
}

if ($success eq "true") {
  open (OUTFILE, ">" . $botFilename);
  print (OUTFILE $code);
  close(OUTFILE);

  open (OUTFILE, ">" . $authorFilename);
  print (OUTFILE "Name: " . $authorName . "\nEmail: " . $authorEmail . "\n");
  close(OUTFILE);

  if (!(-e $botFilename) || !(-e $authorFilename)) {
    $success = "false";
    $message = "Sorry, something went wrong. We'll try to figure it out.\n";
  }
}

$message =~ s/\n+$//;

print "<?xml version=\"1.0\" ?>\n<submission>\n  <success>" . $success . "</success>\n"
    . "  <message>" . $message . "</message>\n</submission>\n";
