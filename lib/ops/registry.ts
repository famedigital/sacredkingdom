export type OpsFieldType = 'text' | 'textarea' | 'number' | 'date' | 'boolean' | 'select';

export type OpsField = {
  key: string;
  label: string;
  type: OpsFieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
  booking?: boolean;
};

export type OpsResource = {
  id: string;
  table: string;
  title: string;
  description: string;
  fields: OpsField[];
};

export const OPS_RESOURCES: OpsResource[] = [
  {
    id: 'guides',
    table: 'ops_guides',
    title: 'Guides',
    description: 'Roster, languages, license, and daily rate.',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'languages', label: 'Languages', type: 'text' },
      { key: 'license_no', label: 'License', type: 'text' },
      { key: 'daily_rate', label: 'Daily rate', type: 'number' },
      { key: 'is_available', label: 'Available', type: 'boolean' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  {
    id: 'vehicles',
    table: 'ops_vehicles',
    title: 'Cars',
    description: 'Vehicles, plates, drivers, and capacity.',
    fields: [
      { key: 'name', label: 'Vehicle', type: 'text', required: true },
      { key: 'plate', label: 'Plate', type: 'text' },
      { key: 'driver_name', label: 'Driver', type: 'text' },
      { key: 'driver_phone', label: 'Driver phone', type: 'text' },
      { key: 'capacity', label: 'Capacity', type: 'number' },
      { key: 'daily_rate', label: 'Daily rate', type: 'number' },
      { key: 'is_active', label: 'Active', type: 'boolean' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  {
    id: 'hotels',
    table: 'ops_hotels',
    title: 'Hotels',
    description: 'Contracted properties and room types.',
    fields: [
      { key: 'name', label: 'Property', type: 'text', required: true },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'room_types', label: 'Room types', type: 'text' },
      { key: 'contracted_rate', label: 'Total', type: 'number' },
      { key: 'is_active', label: 'Active', type: 'boolean' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  {
    id: 'rates',
    table: 'ops_rates',
    title: 'Rates',
    description: 'Client quote templates. Package = guide + entry + car + drop (transfers included). Hotel is a stay total, not per night.',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      {
        key: 'rate_type',
        label: 'Type',
        type: 'select',
        options: [
          { value: 'sdf', label: 'SDF' },
          { value: 'package', label: 'Package' },
          { value: 'seasonal', label: 'Seasonal' },
        ],
      },
      { key: 'amount', label: 'Amount', type: 'number' },
      { key: 'currency', label: 'Currency', type: 'text' },
      { key: 'season_start', label: 'Season start', type: 'date' },
      { key: 'season_end', label: 'Season end', type: 'date' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  {
    id: 'sources',
    table: 'ops_sources',
    title: 'Sources',
    description: 'How bookings arrive: agent, website, walk-in, repeat.',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      {
        key: 'source_type',
        label: 'Type',
        type: 'select',
        options: [
          { value: 'agent', label: 'Agent' },
          { value: 'website', label: 'Website' },
          { value: 'walk_in', label: 'Walk-in' },
          { value: 'repeat', label: 'Repeat' },
        ],
      },
      { key: 'contact_name', label: 'Contact', type: 'text' },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'is_active', label: 'Active', type: 'boolean' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  {
    id: 'flights',
    table: 'ops_flights',
    title: 'Flights',
    description: 'PNR, airline, Paro arrivals and departures.',
    fields: [
      { key: 'booking_id', label: 'Booking', type: 'text', required: true, booking: true },
      { key: 'pnr', label: 'PNR', type: 'text' },
      { key: 'airline', label: 'Airline', type: 'text' },
      { key: 'flight_no', label: 'Flight no.', type: 'text' },
      {
        key: 'direction',
        label: 'Direction',
        type: 'select',
        options: [
          { value: 'arrival', label: 'Arrival' },
          { value: 'departure', label: 'Departure' },
        ],
      },
      { key: 'airport', label: 'Airport', type: 'text' },
      { key: 'scheduled_at', label: 'Scheduled', type: 'date' },
      { key: 'pax_names', label: 'Passenger names', type: 'textarea' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  {
    id: 'payments',
    table: 'ops_payments',
    title: 'Payments',
    description: 'Receipts against bookings.',
    fields: [
      { key: 'booking_id', label: 'Booking', type: 'text', required: true, booking: true },
      { key: 'amount', label: 'Amount', type: 'number', required: true },
      { key: 'method', label: 'Method', type: 'text' },
      { key: 'paid_on', label: 'Date', type: 'date' },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'pending', label: 'Pending' },
          { value: 'received', label: 'Received' },
          { value: 'refunded', label: 'Refunded' },
        ],
      },
      { key: 'reference', label: 'Reference', type: 'text' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  {
    id: 'expenses',
    table: 'ops_expenses',
    title: 'Expenses',
    description: 'Guide fees, fuel, hotels, and misc costs.',
    fields: [
      { key: 'booking_id', label: 'Booking', type: 'text', required: true, booking: true },
      {
        key: 'category',
        label: 'Category',
        type: 'select',
        options: [
          { value: 'guide', label: 'Guide' },
          { value: 'fuel', label: 'Fuel' },
          { value: 'hotel', label: 'Hotel' },
          { value: 'misc', label: 'Misc' },
        ],
      },
      { key: 'amount', label: 'Amount', type: 'number', required: true },
      { key: 'incurred_on', label: 'Date', type: 'date' },
      { key: 'vendor', label: 'Vendor', type: 'text' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
];

export function getOpsResource(id: string): OpsResource | undefined {
  return OPS_RESOURCES.find((item) => item.id === id);
}

export function emptyOpsRecord(resource: OpsResource): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const field of resource.fields) {
    if (field.type === 'boolean') row[field.key] = true;
    else if (field.type === 'number') row[field.key] = '';
    else if (field.type === 'select') row[field.key] = field.options?.[0]?.value || '';
    else row[field.key] = '';
  }
  return row;
}
