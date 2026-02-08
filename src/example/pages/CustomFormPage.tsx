import { Controller, useForm } from 'react-hook-form';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { TextArea } from '../../components/TextArea';
import { RadioGroup } from '../../components/RadioGroup';
import { InputDateRangePicker } from '../../components/InputDateRangePicker';
import { FormErrorMessage } from '../../components/FormErrorSignal';
import { Search, Calendar } from 'lucide-react';
import { AsyncSelectSection } from '../custom-page-sections/AsyncSelectSection';
import { UnstyledSelectSection } from '../custom-page-sections/UnstyledSelectSection';

type FormValues = {
  category: string | null;
  name: string;
  status: string | null;
  username: string;
  eventFromDate: Date | null;
  eventToDate: Date | null;
  description: string;
  priority: string;
};

export function CustomFormPage() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      category: null,
      name: '',
      status: null,
      username: '',
      eventFromDate: null,
      eventToDate: null,
      description: '',
      priority: '',
    },
    mode: 'onTouched',
  });

  const onSubmit = (data: FormValues) => {
    console.log('Submitted:', data);
  };

  return (
    <div className="page-content w-full">
      <div className="grid gap-4 w-full max-w-[250px]">
        <form onSubmit={handleSubmit(onSubmit)} className="border border-line bg-surface p-card space-y-4 rounded-lg w-full">
          <h1 className="text-xl font-bold mb-4">Custom Form</h1>
          <div className="grid gap-1">
            <div className="flex flex-col">
              <label className="form-label" htmlFor="category">Category & Name</label>
              <div className="input-group">
                <div className="w-[100px]">
                  <Controller
                    name="category"
                    control={control}
                    rules={{ required: 'Category is required' }}
                    render={({ field: { onChange, value } }) => (
                      <Select
                        id="category"
                        options={[
                          { value: 'option1', label: 'Option 1' },
                          { value: 'option2', label: 'Option 2' },
                          { value: 'option3', label: 'Option 3' },
                        ]}
                        value={value}
                        onChange={onChange}
                        placeholder="Select..."
                        error={!!errors.category}
                        clearable
                      />
                    )}
                  />
                </div>
                <div className="input-group-divider"/>
                <Input
                  className="flex"
                  placeholder="Enter value..."
                  error={!!errors.name}
                  {...register('name', { required: 'Name is required' })}
                />
              </div>
              <FormErrorMessage error={errors.category || errors.name} />
            </div>
            <div className="flex flex-col">
              <label className="form-label" htmlFor="status">Status</label>
              <div className="w-8/12">
                <Controller
                  name="status"
                  control={control}
                  rules={{ required: 'Status is required' }}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      id="status"
                      startIcon={<Search size={16}/>}
                      options={[
                        { value: 'active', label: 'Active', icon: <span style={{ color: '#22c55e' }}>●</span> },
                        { value: 'pending', label: 'Pending', icon: <span style={{ color: '#eab308' }}>●</span> },
                        { value: 'inactive', label: 'Inactive', icon: <span style={{ color: '#ef4444' }}>●</span> },
                      ]}
                      value={value}
                      onChange={onChange}
                      placeholder="Select status..."
                      error={!!errors.status}
                      clearable
                      searchable={false}
                    />
                  )}
                />
              </div>
              <FormErrorMessage error={errors.status} />
            </div>
            <div className="flex flex-col">
              <label className="form-label" htmlFor="username">Username</label>
              <Input
                id="username"
                placeholder="Enter username..."
                error={!!errors.username}
                {...register('username', { required: 'Username is required' })}
              />
              <FormErrorMessage error={errors.username} />
            </div>
            <div className="flex flex-col">
              <span className="form-label">Event Dates</span>
              <Controller
                name="eventFromDate"
                control={control}
                rules={{ required: 'From date is required' }}
                render={({ field: { onChange: onFromDateChange, value: fromDate } }) => (
                  <Controller
                    name="eventToDate"
                    control={control}
                    rules={{ required: 'To date is required' }}
                    render={({ field: { onChange: onToDateChange, value: toDate } }) => (
                      <InputDateRangePicker
                        fromDate={fromDate}
                        toDate={toDate}
                        onFromDateChange={onFromDateChange}
                        onToDateChange={onToDateChange}
                        placeholder="Select event dates"
                        endIcon={<Calendar size={18} />}
                        error={!!errors.eventFromDate || !!errors.eventToDate}
                      />
                    )}
                  />
                )}
              />
              <FormErrorMessage error={errors.eventFromDate || errors.eventToDate} />
            </div>
            <div className="flex flex-col">
              <label className="form-label" htmlFor="description">Description</label>
              <TextArea
                id="description"
                placeholder="Enter description..."
                rows={3}
                error={!!errors.description}
                {...register('description', { required: 'Description is required' })}
              />
              <FormErrorMessage error={errors.description} />
            </div>
            <div className="flex flex-col">
              <span className="form-label">Priority</span>
              <Controller
                name="priority"
                control={control}
                rules={{ required: 'Priority is required' }}
                render={({ field: { onChange, value } }) => (
                  <RadioGroup
                    name="priority"
                    value={value}
                    onChange={onChange}
                    error={!!errors.priority}
                    options={[
                      { value: 'low', label: 'Low' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'high', label: 'High' },
                    ]}
                    className="flex gap-4"
                  />
                )}
              />
              <FormErrorMessage error={errors.priority} />
            </div>
            <div className="flex justify-end">
              <Button type="submit">Submit</Button>
            </div>
          </div>
        </form>
        <div className="border border-line bg-surface p-card space-y-4 rounded-lg w-full">
          <AsyncSelectSection/>
        </div>
        <div className="border border-line bg-surface p-card space-y-4 rounded-lg w-full">
          <UnstyledSelectSection/>
        </div>
      </div>
    </div>
  );
}
