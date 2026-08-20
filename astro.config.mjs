import { defineConfig } from 'astro/config';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

/** @param {string} value */
const escapeAttribute = (value) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
/** @param {string} value */
const escapeHtml = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

const localizeStaticRoutes = () => ({
  name: 'bezaverse-localize-static-routes',
  hooks: {
    /** @param {{ dir: URL }} args */
    'astro:build:done': async ({ dir }) => {
      const outputDir = fileURLToPath(dir);
      /** @type {string[]} */
      const files = [];
      /** @param {string} directory */
      const collect = async (directory) => {
        for (const entry of await readdir(directory, { withFileTypes: true })) {
          const entryPath = join(directory, entry.name);
          if (entry.isDirectory()) await collect(entryPath);
          else if (entry.name.endsWith('.html')) files.push(entryPath);
        }
      };
      await collect(outputDir);

      for (const file of files) {
        let html = await readFile(file, 'utf8');
        const messagesMatch = html.match(/<script[^>]*id="i18n-data"[^>]*>([\s\S]*?)<\/script>/);
        if (!messagesMatch) continue;
        const messages = JSON.parse(messagesMatch[1]);
        const locale = relative(outputDir, file).split(/[\\/]/)[0] === 'ar' ? 'ar' : 'en';
        const localized = messages[locale] ?? messages.en;
        const isArabic = locale === 'ar';
        /** @type {string[]} */
        const staticBlocks = [];

        html = html.replace(/<html([^>]*)\slang="[^"]*"([^>]*)\sdir="[^"]*"([^>]*)>/, `<html$1 lang="${locale}"$2 dir="${isArabic ? 'rtl' : 'ltr'}"$3>`);
        html = html.replace(/(<html[^>]*\sdata-locale=")[^"]*(")/i, `$1${locale}$2`);
        if (isArabic) {
          html = html.replace(messagesMatch[0], '<!-- bezaverse-i18n-data -->');
          html = html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, (block) => {
            const marker = `<!-- bezaverse-static-block-${staticBlocks.length} -->`;
            staticBlocks.push(block);
            return marker;
          });
          html = html.replace(/(<([a-z0-9]+)\b[^>]*data-i18n-html="([^"]+)"[^>]*>)[\s\S]*?(<\/\2>)/gi, (full, opening, _tag, key, closing) => localized[key] ? `${opening}${localized[key]}${closing}` : full);
          html = html.replace(/(<([a-z0-9]+)\b[^>]*data-i18n="([^"]+)"[^>]*>)[\s\S]*?(<\/\2>)/gi, (full, opening, _tag, key, closing) => localized[key] ? `${opening}${escapeHtml(localized[key])}${closing}` : full);
          html = html.replace(/<([a-z0-9]+)\b([^>]*data-i18n-placeholder="([^"]+)"[^>]*)>/gi, (full, tag, attributes, key) => {
            const value = localized[key];
            return value ? `<${tag}${attributes.replace(/\splaceholder="[^"]*"/i, ` placeholder="${escapeAttribute(value)}"`)}>` : full;
          });
          html = html.replace(/<([a-z0-9]+)\b([^>]*data-i18n-alt="([^"]+)"[^>]*)>/gi, (full, tag, attributes, key) => {
            const value = localized[key];
            return value ? `<${tag}${attributes.replace(/\salt="[^"]*"/i, ` alt="${escapeAttribute(value)}"`)}>` : full;
          });
          html = html.replace(/<([a-z0-9]+)\b([^>]*data-i18n-aria-label="([^"]+)"[^>]*)>/gi, (full, tag, attributes, key) => {
            const value = localized[key];
            return value ? `<${tag}${attributes.replace(/\saria-label="[^"]*"/i, ` aria-label="${escapeAttribute(value)}"`)}>` : full;
          });
          html = html.replace(/<h2>Let(?:'|’)s make the next<br><em>good thing\.<\/em><\/h2>/i, `<h2 data-i18n-html="footer.title">${localized['footer.title'] ?? ''}</h2>`);
          for (const [key, value] of Object.entries(localized).sort((a, b) => String(messages.en?.[b[0]] ?? '').length - String(messages.en?.[a[0]] ?? '').length)) {
            const english = messages.en?.[key];
            if (!english || typeof value !== 'string' || typeof english !== 'string' || english === value || english.includes('<')) continue;
            html = html.split(english).join(value);
          }
          const titleKey = html.match(/data-title-key="([^"]+)"/)?.[1];
          const descriptionKey = html.match(/data-description-key="([^"]+)"/)?.[1];
          if (titleKey && localized[titleKey]) html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(localized[titleKey])} · Bezaverse</title>`);
          if (descriptionKey && localized[descriptionKey]) html = html.replace(/(<meta name="description"[^>]*content=")[^"]*("[^>]*>)/, `$1${escapeAttribute(localized[descriptionKey])}$2`);
          html = html.replace(/assets\/flags\/us\.svg/g, 'assets/flags/eg.svg');
          html = html.replace(/(<span class="locale-switcher-name"[^>]*>)[\s\S]*?(<\/span>)/i, '$1English$2');
          html = html.replace(/assets\/flags\/eg\.svg/g, 'assets/flags/us.svg');
          html = html.replace('<!-- bezaverse-i18n-data -->', messagesMatch[0]);
        }
        const basePath = (html.match(/data-base="([^"]*)"/)?.[1] ?? '/').replace(/\/$/, '');
        html = html.replace(/href="([^"]*)"/gi, (full, href) => {
          if (!href.startsWith('/') || href.startsWith('//') || !href.startsWith(`${basePath}/`)) return full;
          const remainder = href.slice(basePath.length);
          if (/^\/(?:_astro|assets|fonts|favicon)/i.test(remainder)) return full;
          const pathAndHash = remainder.replace(/^\/(en|ar)(?=\/|$)/, '');
          return `href="${basePath}/${locale}${pathAndHash === '/' ? '' : pathAndHash}"`;
        });
        staticBlocks.forEach((block, index) => {
          html = html.replace(`<!-- bezaverse-static-block-${index} -->`, block);
        });
        html = html.replace(' data-locale-pending="true"', '');
        await writeFile(file, html, 'utf8');
      }
    },
  },
});

export default defineConfig({
  site: 'https://andronasef.github.io/bezaverse-website',
  base: process.env.NODE_ENV === 'production' ? '/bezaverse-website' : '/',
  output: 'static',
  integrations: [localizeStaticRoutes()],
  prefetch: true,
});
