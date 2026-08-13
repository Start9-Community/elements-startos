import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'elements',
  title: 'Elements (Liquid)',
  license: 'MIT',
  packageRepo: 'https://github.com/Start9-Community/elements-startos',
  upstreamRepo: 'https://github.com/ElementsProject/elements',
  marketingUrl: 'https://liquid.net/',
  donationUrl: null,
  description: { short, long },
  volumes: ['main'],
  images: {
    elements: {
      source: {
        dockerBuild: {
          buildArgs: {
            VERSION: '23.3.3',
          },
        },
      },
      arch: ['aarch64', 'x86_64'],
    },
  },
  hardwareRequirements: {
    // elementsd's own working set plus the default dbcache sits near 1.5 GB
    // during IBD; 4 GB is the floor at which it coexists with StartOS and a
    // Lightning stack rather than driving the box into swap. StartOS compares
    // this against MemTotal, which is a few hundred MiB under the advertised
    // capacity, so a literal 4 GiB rejects every 4 GB machine. 3 GiB sits
    // between the 2 and 4 GB tiers.
    ram: 3 * 1024 ** 3,
  },
  dependencies: {},
})
