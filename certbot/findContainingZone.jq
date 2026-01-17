$ARGS.named.dns_name as $d
| map(
    . as $z
    | if $d == $z.name then
        { zone: $z, subdomain: "@" }
    elif $d | endswith("." + $z.name) then
        { zone: $z, subdomain: $d[:-($z.name | length + 1)] }
    else empty end
)
| sort_by(.zone.name | -length)
| .[0]
| select(.)
