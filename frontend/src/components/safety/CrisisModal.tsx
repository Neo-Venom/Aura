import { useEffect, useState } from 'react';
import { Modal } from '../ui-kit/Dialog';
import { ResourceList } from './ResourceList';
import { useUi } from '../../app/store';
import { useProfile } from '../../app/auth';
import { en } from '../../copy/en';

export function CrisisContent({ initialCountry }: { initialCountry: string | null }) {
  const [country, setCountry] = useState<string | null>(initialCountry);
  useEffect(() => setCountry(initialCountry), [initialCountry]);
  return (
    <div className="space-y-5">
      <p className="text-base">{en.support.intro}</p>
      <ResourceList country={country} onCountryChange={setCountry} />
    </div>
  );
}

export function CrisisModal() {
  const open = useUi((s) => s.crisisOpen);
  const setOpen = useUi((s) => s.setCrisisOpen);
  const { data } = useProfile();
  return (
    <Modal open={open} onOpenChange={setOpen} title={en.support.title} testId="crisis-modal" className="max-w-xl">
      <CrisisContent initialCountry={data?.country_code ?? null} />
    </Modal>
  );
}
