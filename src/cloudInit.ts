export type CloudInitPhoneHome = {
  pub_key_rsa: string;
  pub_key_ecdsa: string;
  pub_key_ed25519: string;
  instance_id: string;
  hostname: string;
  fqdn: string;
};
