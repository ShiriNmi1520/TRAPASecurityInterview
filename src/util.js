const nacl = require('tweetnacl')
const aws = require('aws-sdk')
const config = require('./config')

const verifySignature = (signature, timestamp, body) => {
  return new Promise((resolve, reject) => {
    try {
      const verified = nacl.sign.detached.verify(
        Buffer.from(timestamp + JSON.stringify(body)),
        Buffer.from(signature, 'hex'),
        Buffer.from(config.discord.token, 'hex')
      )
      resolve(verified)
    } catch (verifyError) {
      console.error('Signature verification error', verifyError)
      reject(new Error('Invalid signature'))
    }
  })
}

const getSecret = (secretName, regionName) => {
  return new Promise((resolve, reject) => {
    const client = new aws.SecretsManager({
      region: regionName,
    })
    client.getSecretValue({ SecretId: secretName }, (getSecretError, data) => {
      if (getSecretError) {
        console.error('Error retrieving secret', getSecretError)
        reject(getSecretError)
      } else {
        resolve(data.SecretString)
      }
    })
  })
}

module.exports = {
  verifySignature,
  getSecret,
}