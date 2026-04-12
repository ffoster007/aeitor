import Script from "next/script";
import { buildThemeInitScript } from "@/lib/theme";

function escapeInlineScript(script: string) {
  return script
    .replace(/<\/script/gi, "<\\/script")
    .replace(/<!--/g, "<\\!--")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function ThemeScript() {
  return (
    <Script id="theme-init" strategy="beforeInteractive">
      {escapeInlineScript(buildThemeInitScript())}
    </Script>
  );
}