import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';

async function run() {
  const { data: html } = await axios.get('https://udyamregistration.gov.in/UdyamRegistration.aspx', {
    timeout: 60000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36'
    }
  });

  const $ = cheerio.load(html);
  const fields: Array<{ tag: string; id: string | null; name: string | null; type: string | null; label: string; required: boolean }> = [];

  $('input, select, button').each((_, el) => {
    const $el = $(el);
    const id = $el.attr('id') || null;
    const name = $el.attr('name') || null;
    const type = $el.attr('type') || null;
    const label = id ? $(`label[for="${id}"]`).text().trim().replace(/\s+/g, ' ') : '';
    const required = $el.is('[required]');
    fields.push({ tag: el.tagName, id, name, type, label, required });
  });

  await fs.mkdir('schemas', { recursive: true });
  await fs.writeFile('schemas/udyam_step1_2_raw.json', JSON.stringify({ fields }, null, 2));
  console.log('Saved schemas/udyam_step1_2_raw.json');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
}); 