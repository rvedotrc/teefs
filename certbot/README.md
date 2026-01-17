# certbot

## Setup

```shell
mkdir -p config work logs
./certbot --non-interactive register --agree-tos --no-eff-email -m rachel@rachelevans.org
```

which creates:

```text
./config/accounts/acme-v02.api.letsencrypt.org/directory/???/regr.json
./config/accounts/acme-v02.api.letsencrypt.org/directory/???/private_key.json
./config/accounts/acme-v02.api.letsencrypt.org/directory/???/meta.json
```

where `???` is an opaque ID which I'm not sure is secret or not.

`private_key.json` is key material. `meta.json` is created date, etc. `regr.json` contains your account ID.

## Getting a new cert, automated

```shell
./hetzner-certonly something.shonk.dk
```
