import { initializeGlobalGear } from '../services/gearService'
import type { LibraryItem } from '../types/StudioItem'

// Sample gear data - converted from the original static array with string IDs
const sampleGearData: Omit<LibraryItem, 'id'>[] = [
  {
    name: 'Genelec 1031A',
    productModel: 'Genelec 1031A',
    dimensions: { width: 0.19, height: 0.28 },
    connections: [
      { id: 'genelec-xlr-in', name: 'XLR Input', direction: 'input', physical: 'XLR', category: 'balanced', way: 'socket' },
      { id: 'genelec-trs-in', name: 'TRS Input', direction: 'input', physical: 'TRS', category: 'balanced', way: 'socket' }
    ],
    category: 'Speakers',
    icon: '/src/assets/library_images/genelec_1031a.jpg',
    isOfficial: true,
    tags: ['monitor', 'studio', 'nearfield']
  },
  {
    name: 'MOTU 828',
    productModel: 'MOTU 828',
    dimensions: { width: 0.48, height: 0.22 },
    connections: [
      // Front panel mic/line/hi-Z inputs (2x XLR/TRS combo)
      { id: 'motu-mic1', name: 'Mic/Line/Hi-Z Input 1', direction: 'input', physical: 'XLR', category: 'balanced', way: 'socket' },
      { id: 'motu-mic2', name: 'Mic/Line/Hi-Z Input 2', direction: 'input', physical: 'XLR', category: 'balanced', way: 'socket' },
      // Rear panel line inputs (8x TRS)
      { id: 'motu-line3', name: 'Line Input 3', direction: 'input', physical: 'TRS', category: 'balanced', way: 'socket' },
      { id: 'motu-line4', name: 'Line Input 4', direction: 'input', physical: 'TRS', category: 'balanced', way: 'socket' },
      { id: 'motu-line5', name: 'Line Input 5', direction: 'input', physical: 'TRS', category: 'balanced', way: 'socket' },
      { id: 'motu-line6', name: 'Line Input 6', direction: 'input', physical: 'TRS', category: 'balanced', way: 'socket' },
      { id: 'motu-line7', name: 'Line Input 7', direction: 'input', physical: 'TRS', category: 'balanced', way: 'socket' },
      { id: 'motu-line8', name: 'Line Input 8', direction: 'input', physical: 'TRS', category: 'balanced', way: 'socket' },
      { id: 'motu-line9', name: 'Line Input 9', direction: 'input', physical: 'TRS', category: 'balanced', way: 'socket' },
      { id: 'motu-line10', name: 'Line Input 10', direction: 'input', physical: 'TRS', category: 'balanced', way: 'socket' },
      
      // Main analog outputs (2x XLR)
      { id: 'motu-main-l', name: 'Main Out L', direction: 'output', physical: 'XLR', category: 'balanced', way: 'plug' },
      { id: 'motu-main-r', name: 'Main Out R', direction: 'output', physical: 'XLR', category: 'balanced', way: 'plug' },
      // Line outputs (8x TRS)
      { id: 'motu-out3', name: 'Line Out 3', direction: 'output', physical: 'TRS', category: 'balanced', way: 'plug' },
      { id: 'motu-out4', name: 'Line Out 4', direction: 'output', physical: 'TRS', category: 'balanced', way: 'plug' },
      { id: 'motu-out5', name: 'Line Out 5', direction: 'output', physical: 'TRS', category: 'balanced', way: 'plug' },
      { id: 'motu-out6', name: 'Line Out 6', direction: 'output', physical: 'TRS', category: 'balanced', way: 'plug' },
      { id: 'motu-out7', name: 'Line Out 7', direction: 'output', physical: 'TRS', category: 'balanced', way: 'plug' },
      { id: 'motu-out8', name: 'Line Out 8', direction: 'output', physical: 'TRS', category: 'balanced', way: 'plug' },
      { id: 'motu-out9', name: 'Line Out 9', direction: 'output', physical: 'TRS', category: 'balanced', way: 'plug' },
      { id: 'motu-out10', name: 'Line Out 10', direction: 'output', physical: 'TRS', category: 'balanced', way: 'plug' },
      
      // Headphone outputs (2x front panel)
      { id: 'motu-hp1', name: 'Headphone Out 1', direction: 'output', physical: '1/4', category: 'unbalanced', way: 'socket' },
      { id: 'motu-hp2', name: 'Headphone Out 2', direction: 'output', physical: '1/4', category: 'unbalanced', way: 'socket' },
      
      // Digital I/O - ADAT (16 channels total via 2 optical banks)
      { id: 'motu-adat-in-a', name: 'ADAT Bank A In', direction: 'input', physical: 'Optical', category: 'digital', way: 'socket' },
      { id: 'motu-adat-in-b', name: 'ADAT Bank B In', direction: 'input', physical: 'Optical', category: 'digital', way: 'socket' },
      { id: 'motu-adat-out-a', name: 'ADAT Bank A Out', direction: 'output', physical: 'Optical', category: 'digital', way: 'plug' },
      { id: 'motu-adat-out-b', name: 'ADAT Bank B Out', direction: 'output', physical: 'Optical', category: 'digital', way: 'plug' },
      
      // S/PDIF digital (RCA)
      { id: 'motu-spdif-in', name: 'S/PDIF In', direction: 'input', physical: 'RCA', category: 'digital', way: 'socket' },
      { id: 'motu-spdif-out', name: 'S/PDIF Out', direction: 'output', physical: 'RCA', category: 'digital', way: 'plug' },
      
      // MIDI I/O
      { id: 'motu-midi-in', name: 'MIDI In', direction: 'input', physical: 'MIDI', category: 'midi', way: 'socket' },
      { id: 'motu-midi-out', name: 'MIDI Out', direction: 'output', physical: 'MIDI', category: 'midi', way: 'plug' },
      { id: 'motu-midi-thru', name: 'MIDI Thru', direction: 'output', physical: 'MIDI', category: 'midi', way: 'plug' },
      
      // Word Clock I/O (BNC)
      { id: 'motu-wc-in', name: 'Word Clock In', direction: 'input', physical: 'BNC', category: 'digital', way: 'socket' },
      { id: 'motu-wc-out', name: 'Word Clock Out', direction: 'output', physical: 'BNC', category: 'digital', way: 'plug' },
      { id: 'motu-wc-thru', name: 'Word Clock Thru', direction: 'output', physical: 'BNC', category: 'digital', way: 'plug' },
      
      // Footswitch input
      { id: 'motu-footswitch', name: 'Footswitch In', direction: 'input', physical: '1/4', category: 'control', way: 'socket' }
    ],
    category: 'Interface',
    icon: '/src/assets/library_images/motu_828.jpg',
    rackUnits: 1,
    isOfficial: true,
    tags: ['interface', 'audio', '1U', 'firewire']
  },
  {
    name: 'Roland JP-8000',
    productModel: 'Roland JP-8000',
    dimensions: { width: 1.2, height: 0.4 },
    connections: [
      { id: 'jp8000-audio-l', name: 'Audio Out L', direction: 'output', physical: '1/4', category: 'unbalanced', way: 'plug' },
      { id: 'jp8000-audio-r', name: 'Audio Out R', direction: 'output', physical: '1/4', category: 'unbalanced', way: 'plug' },
      { id: 'jp8000-midi-in', name: 'MIDI In', direction: 'input', physical: 'MIDI', category: 'midi', way: 'socket' },
      { id: 'jp8000-midi-out', name: 'MIDI Out', direction: 'output', physical: 'MIDI', category: 'midi', way: 'plug' }
    ],
    category: 'Synth',
    icon: '/src/assets/library_images/roland_jp8000.jpg',
    isOfficial: true,
    tags: ['synthesizer', 'analog modeling', 'desktop', 'supersaw']
  },
  {
    name: 'Yamaha O2R',
    productModel: 'Yamaha O2R',
    dimensions: { width: 1.8, height: 0.8 },
    connections: [
      { id: 'o2r-ch1', name: 'Ch1 Input', direction: 'input', physical: 'XLR', category: 'balanced', way: 'socket' },
      { id: 'o2r-ch2', name: 'Ch2 Input', direction: 'input', physical: 'XLR', category: 'balanced', way: 'socket' },
      { id: 'o2r-ch3', name: 'Ch3 Input', direction: 'input', physical: 'XLR', category: 'balanced', way: 'socket' },
      { id: 'o2r-ch4', name: 'Ch4 Input', direction: 'input', physical: 'XLR', category: 'balanced', way: 'socket' },
      { id: 'o2r-main-l', name: 'Main Out L', direction: 'output', physical: 'XLR', category: 'balanced', way: 'plug' },
      { id: 'o2r-main-r', name: 'Main Out R', direction: 'output', physical: 'XLR', category: 'balanced', way: 'plug' }
    ],
    category: 'Mixer',
    icon: '/src/assets/library_images/yamaha_o2r.jpg',
    isOfficial: true,
    tags: ['mixing console', 'digital', 'large format', 'automation']
  },
  {
    name: '19" Equipment Rack',
    productModel: 'Standard 19" Rack 12U',
    dimensions: { width: 0.6, height: 0.7 },
    connections: [
      { id: 'rack-power-in', name: 'Power Input', direction: 'input', physical: 'XLR', category: 'digital', way: 'socket' }
    ],
    category: 'Rack',
    icon: '/src/assets/library_images/rack_12u.jpg',
    isRack: true,
    rackCapacity: 12,
    isOfficial: true,
    tags: ['rack', '19 inch', '12U', 'equipment rack']
  },
  {
    name: 'Focusrite Scarlett 18i20',
    productModel: 'Focusrite Scarlett 18i20',
    dimensions: { width: 0.48, height: 0.25 },
    connections: [
      { id: 'scarlett-mic1', name: 'Mic Input 1', direction: 'input', physical: 'XLR', category: 'balanced', way: 'socket' },
      { id: 'scarlett-mic2', name: 'Mic Input 2', direction: 'input', physical: 'XLR', category: 'balanced', way: 'socket' },
      { id: 'scarlett-out1', name: 'Line Out 1', direction: 'output', physical: 'TRS', category: 'balanced', way: 'plug' },
      { id: 'scarlett-out2', name: 'Line Out 2', direction: 'output', physical: 'TRS', category: 'balanced', way: 'plug' },
      { id: 'scarlett-hp1', name: 'Headphone Out 1', direction: 'output', physical: '1/4', category: 'unbalanced', way: 'socket' },
      { id: 'scarlett-hp2', name: 'Headphone Out 2', direction: 'output', physical: '1/4', category: 'unbalanced', way: 'socket' }
    ],
    category: 'Interface',
    icon: '/src/assets/library_images/focusrite_scarlett.jpg',
    rackUnits: 1,
    isOfficial: true,
    tags: ['interface', 'USB', '1U', 'home studio']
  },
  {
    name: 'DBX 266xs Compressor',
    productModel: 'DBX 266xs',
    dimensions: { width: 0.48, height: 0.25 },
    connections: [
      { id: 'dbx-in1', name: 'Input 1', direction: 'input', physical: 'XLR', category: 'balanced', way: 'socket' },
      { id: 'dbx-in2', name: 'Input 2', direction: 'input', physical: 'XLR', category: 'balanced', way: 'socket' },
      { id: 'dbx-out1', name: 'Output 1', direction: 'output', physical: 'XLR', category: 'balanced', way: 'plug' },
      { id: 'dbx-out2', name: 'Output 2', direction: 'output', physical: 'XLR', category: 'balanced', way: 'plug' }
    ],
    category: 'Processor',
    icon: '/src/assets/library_images/dbx_266xs.jpg',
    rackUnits: 1,
    isOfficial: true,
    tags: ['compressor', 'dynamic processing', '1U', 'dual channel']
  }
]

/**
 * Initialize the global gear collection with sample data
 * This should be run once to populate the Firebase database
 */
export async function runGearMigration() {
  try {
    console.log('Starting global gear initialization...')
    await initializeGlobalGear(sampleGearData)
    console.log('✅ Global gear collection initialized successfully!')
    console.log(`Added ${sampleGearData.length} sample gear items`)
  } catch (error) {
    console.error('❌ Failed to initialize global gear:', error)
    throw error
  }
}

// Export the sample data for use elsewhere if needed
export { sampleGearData }

// If this script is run directly (not imported), execute the migration
if (typeof window === 'undefined' && require.main === module) {
  runGearMigration()
    .then(() => {
      console.log('Migration completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Migration failed:', error)
      process.exit(1)
    })
}