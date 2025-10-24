import * as models from "./hetznerModels.js";

export const cliMap = {
  // certificate        Manage Certificates
  datacenter: "Datacenter",
  //   firewall:           models.Firewall,
  //   floating-ip        Manage Floating IPs
  image: "Image",
  //   iso                View ISOs
  //   load-balancer      Manage Load Balancers
  //   load-balancer-type View Load Balancer Types
  location: "Location",
  //   network            Manage Networks
  //   placement-group    Manage Placement Groups
  //   primary-ip         Manage Primary IPs
  server: "Server",
  "server-type": "ServerType",
  //   ssh-key            Manage SSH Keys
  volume: "Volume",
  //   zone               [experimental] Manage DNS Zones and Zone RRSets (records)
} as Record<string, keyof typeof models>;
