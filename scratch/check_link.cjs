const { execSync } = require('child_process');
const siteId = "54f42485-654b-4cbd-94cb-a23254fc563f";
try {
    const output = execSync(`npx netlify api getSite --data "{\\"site_id\\": \\"${siteId}\\"}"`, { encoding: 'utf8' });
    const site = JSON.parse(output);
    console.log("BUILD SETTINGS:");
    console.log(JSON.stringify(site.build_settings, null, 2));
} catch (error) {
    console.error(error.message);
}
