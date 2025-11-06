# teefs

```shell
# DANGER! Deletes all servers.
./with-hcloud sh -c "hcloud server list --output=json | jq '.[].id' | xargs hcloud server delete"
```

## certbot + Hetzner

Hook1 is passed ENV:

```text
"CERTBOT_ALL_DOMAINS": "hooktest.teefs.eu"
"CERTBOT_DOMAIN": "hooktest.teefs.eu"
"CERTBOT_REMAINING_CHALLENGES": "0"
"CERTBOT_VALIDATION": "a secret string"
```

```shell
./run certonly \
    --non-interactive \
    --manual \
    --preferred-challenges dns \
    --manual-auth-hook ./foo1 \
    --manual-cleanup-hook ./foo2 \
    -d hooktest.teefs.eu
```

Get zone list:

```shell
./with-hcloud hcloud zone list --output json
```

Filter that zone list to the one covering `$CERTBOT_DOMAIN`:

```shell
./with-hcloud hcloud zone list --output json \
    | jq '
        $ENV.CERTBOT_DOMAIN as $d
        | map(
            . as $z
            | if $z.name == $d then
                { zone: $z, subdomain: "" }
              elif $d[-($z.name | length + 1):] == ".\($z.name)" then
                { zone: $z, subdomain: $d[:-($z.name | length + 1)] }
              else empty end
            )
        | sort_by(.zone.name | -length)
        | .[0]
    '
```
