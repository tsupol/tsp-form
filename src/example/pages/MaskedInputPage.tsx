import { useState } from 'react';
import { MaskedInput } from '../../components/MaskedInput';

export function MaskedInputPage() {
  const [phone, setPhone] = useState('');
  const [ssn, setSsn] = useState('');
  const [amount, setAmount] = useState('');
  const [decimal, setDecimal] = useState('');
  const [prefixed, setPrefixed] = useState('');

  return (
    <div className="page-content">
      <div className="grid gap-4 max-w-[500px]">
        <h1 className="heading-1">Masked Input</h1>

        {/* Pattern mode */}
        <section>
          <h3 className="heading-3 mb-3">Pattern Mode</h3>
          <div className="card flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="form-label">Phone (###-###-####)</label>
              <MaskedInput
                mask="###-###-####"
                value={phone}
                onChange={(raw) => setPhone(raw)}
              />
              <span className="text-xs text-muted">Raw: {phone}</span>
            </div>
            <div className="flex flex-col gap-1">
              <label className="form-label">SSN (###-##-####)</label>
              <MaskedInput
                mask="###-##-####"
                value={ssn}
                onChange={(raw) => setSsn(raw)}
              />
              <span className="text-xs text-muted">Raw: {ssn}</span>
            </div>
            <div className="flex flex-col gap-1">
              <label className="form-label">Credit Card (#### #### #### ####)</label>
              <MaskedInput
                mask="#### #### #### ####"
                value=""
              />
            </div>
          </div>
        </section>

        {/* Number mode */}
        <section>
          <h3 className="heading-3 mb-3">Number Mode</h3>
          <div className="card flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="form-label">Amount (thousand separator)</label>
              <MaskedInput
                mask="number"
                value={amount}
                onChange={(raw) => setAmount(raw)}
                decimalScale={0}
              />
              <span className="text-xs text-muted">Raw: {amount}</span>
            </div>
            <div className="flex flex-col gap-1">
              <label className="form-label">Price (2 decimal places)</label>
              <MaskedInput
                mask="number"
                value={decimal}
                onChange={(raw) => setDecimal(raw)}
                decimalScale={2}
              />
              <span className="text-xs text-muted">Raw: {decimal}</span>
            </div>
            <div className="flex flex-col gap-1">
              <label className="form-label">Currency with prefix</label>
              <MaskedInput
                mask="number"
                value={prefixed}
                onChange={(raw) => setPrefixed(raw)}
                prefix="฿ "
                decimalScale={2}
              />
              <span className="text-xs text-muted">Raw: {prefixed}</span>
            </div>
          </div>
        </section>

        {/* Sizes */}
        <section>
          <h3 className="heading-3 mb-3">Sizes</h3>
          <div className="card flex flex-col gap-3">
            <MaskedInput mask="###-###-####" size="sm" placeholder="Small" />
            <MaskedInput mask="###-###-####" size="md" placeholder="Medium" />
            <MaskedInput mask="###-###-####" size="lg" placeholder="Large" />
          </div>
        </section>

      </div>
    </div>
  );
}
