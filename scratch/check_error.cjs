const { execSync } = require('child_process');
const siteId = "54f42485-654b-4cbd-94cb-a23254fc563f";
const deployId = "69f0fe92bae7581683329431";
try {
    const output = execSync(`npx netlify api getDeploy --data "{\\"deploy_id\\": \\"${deployId}\\"}"`, { encoding: 'utf8' });
    const deploy = JSON.parse(output);
    console.log(JSON.stringify({
        id: deploy.id,
        state: deploy.state,
        error_message: deploy.error_message,
        summary: deploy.summary
    }, null, 2));
} catch (error) {
    console.error(error.message);
}
