const { execSync } = require('child_process');
const siteId = "54f42485-654b-4cbd-94cb-a23254fc563f";
try {
    const output = execSync(`npx netlify api listSiteDeploys --data "{\\"site_id\\": \\"${siteId}\\"}"`, { encoding: 'utf8' });
    const deploys = JSON.parse(output);
    console.log(JSON.stringify(deploys.slice(0, 3).map(d => ({
        id: d.id,
        state: d.state,
        created_at: d.created_at,
        commit_ref: d.commit_ref,
        commit_url: d.commit_url
    })), null, 2));
} catch (error) {
    console.error(error.message);
}
