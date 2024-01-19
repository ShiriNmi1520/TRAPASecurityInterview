# TRAPASecurityInterview
![Made with love in Taiwan](https://madewithlove.now.sh/tw?heart=true&template=for-the-badge)
![Discord](https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)  
![AWS](https://img.shields.io/badge/Amazon_AWS-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)  
A project for the TRAPA Security Interview  
Presents a simple Discord bot that implements a few slash commands.
## Tech-Stack
- [Discord.js](https://discord.js.org/#/)
- [Serverless Framework](https://www.serverless.com/)
- [Amazon Web Services](https://aws.amazon.com/)
  - [Lambda](https://aws.amazon.com/lambda/)
  - [API Gateway](https://aws.amazon.com/api-gateway/)
  - [Secrets Manager](https://aws.amazon.com/secrets-manager/)
  - [IAM](https://aws.amazon.com/iam/) (Handled by Serverless Framework)
  - [CloudWatch](https://aws.amazon.com/cloudwatch/) (Handled by Serverless Framework)
  - [CloudFormation](https://aws.amazon.com/cloudformation/) (Handled by Serverless Framework)
  - [EventBridge](https://aws.amazon.com/eventbridge/)
## Architecture
![Architecture](./docs/archiecture.png)
## Demonstration
### Slash Commands
#### Echo
![Echo](./docs/gif/echo.gif)
#### Text Channel
![Text Channel](./docs/gif/text-channel.gif)
#### Mute
![Mute](./docs/gif/mute.gif)
#### Mute (When user is not in a voice channel)
![Mute (When user is not in a voice channel)](./docs/gif/mute-user-not-in-channel.gif)
#### Kick
![Kick](./docs/gif/kick.gif)