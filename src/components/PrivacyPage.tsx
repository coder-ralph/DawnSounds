"use client";

import { LegalLayout, LegalSection } from "@/components/LegalLayout";
import { CONTACT_ISSUE_URL, REMOVAL_ISSUE_URL } from "@/lib/constants";

export function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" intro="DawnSounds is a free, non-commercial fan project. It has no accounts, no ads and no contact forms, and it collects as little as it can. Here is exactly what happens with your data.">
      <LegalSection n={1} title="The short version">
        <ul>
          <li>No sign-up, no email address, no real name — you only type a game nickname (IGN).</li>
          <li>Your settings and progress are kept <strong>on your own device</strong>.</li>
          <li>When you finish a quiz run, your nickname and score are sent to the public leaderboard.</li>
          <li>Visits are counted anonymously. There are no advertising or tracking cookies.</li>
        </ul>
      </LegalSection>

      <LegalSection n={2} title="What stays on your device">
        <p>DawnSounds saves the following in your browser&apos;s local storage so the site remembers you. It never leaves your browser unless described in section 3:</p>
        <ul>
          <li>your IGN, and a short list of recent nicknames so you can switch back to them;</li>
          <li>volume and mute settings, and your interface language;</li>
          <li>the last tab you used and your last chosen Trivia run length;</li>
          <li>Daily Challenge progress, Daily number and streak, kept separately for each nickname you play with;</li>
          <li>scores saved on this device when the global leaderboard can&apos;t be reached.</li>
        </ul>
        <p>You can remove all of it at any time by clearing this site&apos;s data in your browser settings.</p>
      </LegalSection>

      <LegalSection n={3} title="The global leaderboard">
        <p>
          When you finish a run, DawnSounds sends the following to its database (hosted on Supabase): the <strong>IGN you entered</strong>, the mode (and Trivia run length), your score, accuracy, number of correct answers, best streak, and the date. Only your best score per nickname and mode is kept.
        </p>
        <p>
          <strong>This information is public</strong> — anyone can see it on the Ranks tab. Please don&apos;t use your real name, or any personal information, as your IGN. Because there are no accounts, nothing links a nickname to a person.
        </p>
        <p>
          To have a nickname removed from the leaderboard, <a href={REMOVAL_ISSUE_URL} target="_blank" rel="noopener noreferrer">open a removal request on GitHub</a> with the nickname and mode. GitHub issues are public (see section 9), so don&apos;t include anything beyond what the form asks for.
        </p>
      </LegalSection>

      <LegalSection n={4} title="Analytics">
        <p>
          DawnSounds uses Vercel Web Analytics to see which pages are visited and roughly where from (page, referrer, country, browser, operating system and device type). It stores anonymized data and <strong>does not use cookies</strong>: a visitor is recognised by a hash of the request that resets every day, so a person can&apos;t be followed across days or across other websites.
        </p>
      </LegalSection>

      <LegalSection n={5} title="Hosting and server logs">
        <p>
          The site is hosted on Vercel and the leaderboard database on Supabase. As with any website, their servers receive your IP address and browser details when you load the site or submit a score, in order to deliver the service and keep it secure. DawnSounds does not use this to identify you or build profiles.
        </p>
      </LegalSection>

      <LegalSection n={6} title="Read-aloud questions">
        <p>
          Trivia Arena reads questions aloud with your browser&apos;s built-in speech feature. Depending on your browser and device, the voice may be provided online by the browser or operating system vendor. DawnSounds never uses your microphone and never records or uploads audio.
        </p>
      </LegalSection>

      <LegalSection n={7} title="What DawnSounds does not do">
        <ul>
          <li>No advertising, and no selling or sharing of data for marketing.</li>
          <li>No advertising or cross-site tracking cookies.</li>
          <li>No collection of email addresses, phone numbers or other contact details.</li>
        </ul>
      </LegalSection>

      <LegalSection n={8} title="Children">
        <p>DawnSounds isn&apos;t aimed at young children and doesn&apos;t knowingly collect personal information. Everyone — and especially younger players — should pick a nickname that doesn&apos;t reveal who they are.</p>
      </LegalSection>

      <LegalSection n={9} title="Changes and questions">
        <p>
          If this policy changes, the date at the top will change with it. For questions, <a href={CONTACT_ISSUE_URL} target="_blank" rel="noopener noreferrer">open an issue on GitHub</a>.
        </p>
        <p>
          DawnSounds has no contact form or email address, so GitHub is the only way to reach the project. Issues are public, visible to anyone, and handled under <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">GitHub&apos;s own privacy statement</a>. Please don&apos;t post personal information in them.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
