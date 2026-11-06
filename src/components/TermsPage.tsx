"use client";

import { LegalLayout, LegalSection } from "@/components/LegalLayout";
import { MOONTON_URL, TAKEDOWN_ISSUE_URL } from "@/lib/constants";

export function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" intro="DawnSounds is a free fan project made for the Mobile Legends: Bang Bang community. By using it you agree to these simple terms.">
      <LegalSection n={1} title="A non-commercial fan project">
        <p>
          DawnSounds is <strong>unofficial</strong>. It is not affiliated with, endorsed by, or sponsored by Moonton. It is free to use, shows no ads, and is not run for profit.
        </p>
      </LegalSection>

      <LegalSection n={2} title="Mobile Legends: Bang Bang and Moonton">
        <p>
          Mobile Legends: Bang Bang, its hero names, artwork, voice lines, logos and related marks are the property of{" "}
          <a href={MOONTON_URL} target="_blank" rel="noopener noreferrer">Moonton</a> and its licensors. DawnSounds claims no ownership of them and uses them only so fans can identify, enjoy and quiz themselves on the game. Nothing here grants you any right to that material.
        </p>
      </LegalSection>

      <LegalSection n={3} title="Fan-use guidelines">
        <ul>
          <li>Use DawnSounds for your own enjoyment, and share links and your scores freely.</li>
          <li>Don&apos;t use the site, or what it shows, for commercial purposes.</li>
          <li>Don&apos;t bulk-download, scrape or resell the audio, images, questions or leaderboard data.</li>
          <li>If you build on or refer to DawnSounds, give it credit and keep the fan-project disclaimer.</li>
        </ul>
      </LegalSection>

      <LegalSection n={4} title="Playing fair">
        <ul>
          <li>No cheating: don&apos;t submit made-up or tampered scores, or use bots or scripts to play.</li>
          <li>Pick a nickname that isn&apos;t offensive, hateful, or someone else&apos;s name.</li>
          <li>Entries that break these rules may be removed, and leaderboards may be reset or trimmed at any time.</li>
        </ul>
      </LegalSection>

      <LegalSection n={5} title="DawnSounds&apos; own work">
        <p>
          The DawnSounds code, design and written content are © 2026 DawnSounds, all rights reserved. Game assets are not part of that and stay with their owners (section 2).
        </p>
      </LegalSection>

      <LegalSection n={6} title="No warranty">
        <p>
          DawnSounds is provided &ldquo;as is&rdquo;. Game data changes with every patch, so questions, hero details or audio may be out of date or contain mistakes, and the site may be unavailable or change without notice. Use it at your own risk.
        </p>
      </LegalSection>

      <LegalSection n={7} title="Rights-holder requests">
        <p>
          If you own content shown on DawnSounds and would like it changed or removed, please <a href={TAKEDOWN_ISSUE_URL} target="_blank" rel="noopener noreferrer">open a takedown request on GitHub</a> describing what and where. Requests are taken seriously and handled promptly. GitHub issues are public, so keep private contact details out of them; replies are posted in the issue itself.
        </p>
      </LegalSection>

      <LegalSection n={8} title="Changes">
        <p>These terms may be updated from time to time; the date at the top shows the latest version. Continuing to use DawnSounds means you accept the current terms.</p>
      </LegalSection>
    </LegalLayout>
  );
}
