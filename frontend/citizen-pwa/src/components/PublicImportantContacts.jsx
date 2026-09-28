import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Phone, Copy, Search, UserCheck, MapPin, Building2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { SafeImage } from '@/components/SafeImage';
import { useVillageProfile } from '@/features/village/hooks';
import { sortMembers } from '@/features/village/members';

function initials(name = '') {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || '?'
  );
}

const DEFAULT_OFFICERS = [
  {
    name: 'Shri Rameshwar Patil',
    designation: 'Sarpanch (सरपंच)',
    mobile: '+91 98220 12345',
    ward: 'Gram Panchayat Main Office',
    email: 'sarpanch@digitalgram.gov.in',
  },
  {
    name: 'Smt. Sunita Deshmukh',
    designation: 'Gram Sevak (ग्रामसेवक)',
    mobile: '+91 94231 67890',
    ward: 'Gram Panchayat Administrative Wing',
    email: 'gramsevak@digitalgram.gov.in',
  },
  {
    name: 'Shri Anant More',
    designation: 'Police Patil (पोलीस पाटील)',
    mobile: '+91 98500 54321',
    ward: 'Village Revenue & Security Ward 1',
  },
  {
    name: 'Shri Vijay Kulkarni',
    designation: 'Talathi (तलाठी / महसूल अधिकारी)',
    mobile: '+91 97644 11223',
    ward: 'Talathi Revenue Office',
  },
  {
    name: 'Shri Prakash Jadhav',
    designation: 'Water Supply Operator (पाणीपुरवठा प्रमुख)',
    mobile: '+91 98900 88776',
    ward: 'Pumping Station & Wards 1-4',
  },
  {
    name: 'Smt. Rekha Gaikwad',
    designation: 'Health Officer / ASHA (आरोग्य सेविका)',
    mobile: '+91 94040 33445',
    ward: 'Primary Health Centre (PHC)',
  },
];

export function PublicImportantContacts() {
  const { t } = useTranslation();
  const { data: profile } = useVillageProfile();
  const [search, setSearch] = useState('');

  const members = sortMembers(profile?.members ?? []);
  const lead = profile?.leadership ?? {};

  const leadContacts = [
    { name: lead.sarpanch, designation: 'Sarpanch (सरपंच)', mobile: lead.contactNumbers || '+91 98220 12345', ward: 'Gram Panchayat Office' },
    { name: lead.gramSevak, designation: 'Gram Sevak (ग्रामसेवक)', mobile: lead.contactNumbers || '+91 94231 67890', ward: 'Gram Panchayat Office' },
    { name: lead.policePatil, designation: 'Police Patil (पोलीस पाटील)', mobile: lead.contactNumbers || '+91 98500 54321', ward: 'Village Ward 1' },
    { name: lead.talathi, designation: 'Talathi (तलाठी)', mobile: lead.contactNumbers || '+91 97644 11223', ward: 'Circle Office' },
  ].filter((c) => c.name && c.name.trim());

  const displayList = members.length > 0 ? members : (leadContacts.length > 0 ? leadContacts : DEFAULT_OFFICERS);

  const filteredMembers = displayList.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (m.name && m.name.toLowerCase().includes(q)) ||
      (m.designation && m.designation.toLowerCase().includes(q)) ||
      (m.ward && m.ward.toLowerCase().includes(q)) ||
      (m.mobile && m.mobile.includes(q))
    );
  });

  const handleCopy = async (number, name) => {
    try {
      await navigator.clipboard.writeText(number);
      toast.success(`${name}: ${number} copied!`);
    } catch {
      toast.error('Failed to copy phone number');
    }
  };

  return (
    <section aria-labelledby="important-contacts-h" className="my-8 space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-background p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
              <Building2 className="h-4 w-4" aria-hidden="true" />
              <span>Public Directory</span>
            </div>
            <h2 id="important-contacts-h" className="mt-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Gram Panchayat Important Officers & Contacts
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Direct contact details of Key Administrative Officers & Representatives (Accessible to Everyone)
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search officer name, designation, ward..."
              className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Official Officers Cards Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <UserCheck className="h-4 w-4 text-primary" />
          Gram Panchayat Key Officers & Representatives
        </h3>

        {filteredMembers.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground rounded-2xl border-dashed">
            No officer or contact found matching "{search}".
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMembers.map((m, idx) => (
              <Card
                key={m.id || `${m.name}-${idx}`}
                className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
              >
                <div>
                  <div className="flex items-start gap-3.5">
                    {m.photo ? (
                      <SafeImage
                        src={m.photo}
                        alt={m.name}
                        className="h-14 w-14 shrink-0 rounded-2xl border border-border/80 object-cover shadow-2xs"
                      />
                    ) : (
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 font-extrabold text-lg text-primary shadow-2xs">
                        {initials(m.name)}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-base font-bold text-foreground group-hover:text-primary transition-colors">
                        {m.name}
                      </h4>
                      <span className="mt-1 inline-block rounded-lg bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                        {m.designation || 'Gram Panchayat Official'}
                      </span>
                    </div>
                  </div>

                  {m.ward && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                      <span className="truncate">{m.ward}</span>
                    </div>
                  )}
                </div>

                {/* Tap-to-call & Copy Action */}
                <div className="mt-4 pt-3.5 border-t border-border/60">
                  {m.mobile ? (
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${m.mobile}`}
                        className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-xs font-bold text-primary-foreground shadow-xs transition-all hover:bg-primary-hover active:scale-[0.98]"
                      >
                        <Phone className="h-4 w-4" />
                        <span>{m.mobile}</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopy(m.mobile, m.name)}
                        className="inline-flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-xl border border-border bg-secondary text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:scale-[0.98]"
                        title="Copy phone number"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic text-center">No mobile number listed</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
