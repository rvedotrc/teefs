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

## AWS

`aws route53 list-hosted-zones`

```json
{
  "HostedZones": [
    {
      "Id": "/hostedzone/REDACTED",
      "Name": "rachelevans.org.",
      "CallerReference": "REDACTED",
      "Config": {
        "PrivateZone": false
      },
      "ResourceRecordSetCount": 16
    }
  ]
}
```

```text
aws route53 get-hosted-zone --id /hostedzone/REDACTED
{
    "HostedZone": {
        "Id": "/hostedzone/REDACTED",
        "Name": "rachelevans.org.",
        "CallerReference": "REDACTED",
        "Config": {
            "PrivateZone": false
        },
        "ResourceRecordSetCount": 16
    },
    "DelegationSet": {
        "NameServers": [
            "ns-745.awsdns-29.net",
            "ns-61.awsdns-07.com",
            "ns-1189.awsdns-20.org",
            "ns-1950.awsdns-51.co.uk"
        ]
    }
}


 aws route53 list-resource-record-sets --hosted-zone-id /hostedzone/ZEBSFWHBY5VGL
{
    "ResourceRecordSets": [ ... ]
}

e.g.
       {
            "Name": "rachelevans.org.",
            "Type": "TXT",
            "TTL": 300,
            "ResourceRecords": [
                {
                    "Value": "\"...\""
                }
            ]
        }


aws route53 change-resource-record-sets --hosted-zone-id X \
  --change-batch '{"Changes": [{"Action":"CREATE", "ResourceRecordSet": {"Name": "..."...???}}]}'
```

## DanDomain
