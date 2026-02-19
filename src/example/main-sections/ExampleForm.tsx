import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FormErrorMessage } from '../../components/FormErrorSignal';
import { JsonPretty } from '../../components/JsonPretty';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';
import { LabeledCheckbox } from '../../components/LabeledCheckbox';
import { Input } from '../../components/Input';

import { TextArea } from '../../components/TextArea';
import { RadioGroup } from '../../components/RadioGroup';
import { DatePicker } from '../../components/DatePicker';
import { DoubleDatePicker } from '../../components/DoubleDatePicker';
import { NumberSpinner } from '../../components/NumberSpinner';
import { Switch } from '../../components/Switch';
import { Slider } from '../../components/Slider';
import { InputDatePicker } from '../../components/InputDatePicker';
import { InputDateRangePicker } from '../../components/InputDateRangePicker';
import { Search, Mail, Eye, EyeOff, Calendar } from 'lucide-react';

type FormValues = {
  name: string;
  email: string;
  search?: string;
  password?: string;
  age?: number | "";
  quantity?: number | "";
  price?: number | "";
  volume?: number;
  brightness?: number;
  newsletter?: boolean;
  notifications?: boolean;
  darkMode?: boolean;
  singleEdible: string;
  multiEdibles: string[];
  note: string;
  color: string;
  birthday: Date | null;
  flightFromDate: Date | null;
  flightToDate: Date | null;
  eventPeriodStart: Date | null;
  eventPeriodEnd: Date | null;
  vacationFromDate: Date | null;
  vacationToDate: Date | null;
  conferenceFromDate: Date | null;
  conferenceToDate: Date | null;
};

export function ExampleForm() {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    reset,
    control, // Destructure control from useForm
  } = useForm<FormValues>({
    defaultValues: {
      name: "John Mayer",
      email: "test@example.com",
      search: "",
      password: "",
      age: "",
      quantity: 5,
      price: 99,
      volume: 50,
      brightness: 75,
      newsletter: true,
      notifications: false,
      darkMode: true,
      singleEdible: 'banana',
      multiEdibles: ['apple', 'banana', 'grape-aloe', 'very-long-name'],
      note: "This is a note.",
      birthday: null,
      flightFromDate: null,
      flightToDate: null,
      eventPeriodStart: null,
      eventPeriodEnd: null,
      vacationFromDate: null,
      vacationToDate: null,
      conferenceFromDate: new Date(2025, 11, 1), // Dec 1, 2025
      conferenceToDate: new Date(2025, 11, 5), // Dec 5, 2025
    },
    mode: "onTouched",
  });

  const email = watch("email");
  const [submitData, setSubmitData] = useState<any>({});

  const onSubmit = async (data: FormValues) => {
    await new Promise((r) => setTimeout(r, 500));
    setSubmitData(data);
    console.log("Submitted:", data);
  };

  // @ts-ignore
  // @ts-ignore
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="page-content grid gap-3">
      <div className="flex flex-col">
        <label className="form-label" htmlFor="name">Name with Icon</label>
        <Input
          id="name"
          placeholder="Jane Doe"
          error={!!errors.name}
          {...register("name", {
            required: 'Template name is required (min 3 characters)',
            minLength: {
              value: 3,
              message: 'Template name must be at least 3 characters',
            },
          })}
        />
        <FormErrorMessage error={errors.name} />
      </div>

      <div className="flex flex-col">
        <label className="form-label" htmlFor="email">Email with Icon</label>
        <Input
          id="email"
          placeholder="jane@example.com"
          startIcon={<Mail size={18} />}
          error={!!errors.email}
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email",
            },
          })}
        />
        <FormErrorMessage error={errors.email} />
      </div>

      <div className="flex flex-col">
        <label className="form-label" htmlFor="search">Search Input</label>
        <Input
          id="search"
          placeholder="Search..."
          startIcon={<Search size={18} />}
          {...register("search")}
        />
      </div>

      <div className="flex flex-col">
        <label className="form-label" htmlFor="password">Password with Toggle</label>
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          placeholder="Enter password"
          endIcon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          onEndIconClick={() => setShowPassword(!showPassword)}
          {...register("password")}
        />
      </div>

      <div className="flex flex-col">
        <label className="form-label" htmlFor="age">Age</label>
        <Input
          id="age"
          type="number"
          error={!!errors.age}
          {...register("age", {
            required: "Age is required",
            setValueAs: (v) => (v === "" ? "" : Number(v)),
            min: { value: 0, message: "Age must be positive" },
          })}
        />
        <FormErrorMessage error={errors.age} />
      </div>

      <div className="flex flex-col">
        <label className="form-label" htmlFor="quantity">Quantity (NumberSpinner - Extra Small)</label>
        <Controller
          name="quantity"
          control={control}
          rules={{
            required: "Quantity is required",
            min: { value: 1, message: "Quantity must be at least 1" },
            max: { value: 100, message: "Quantity cannot exceed 100" },
          }}
          render={({ field: { onChange, value, ref } }) => (
            <NumberSpinner
              ref={ref}
              id="quantity"
              value={value}
              onChange={onChange}
              min={1}
              max={100}
              step={1}
              scale="sm"
              error={!!errors.quantity}
            />
          )}
        />
        <FormErrorMessage error={errors.quantity} />
      </div>

      <div className="flex flex-col">
        <label className="form-label" htmlFor="price">Price (Diagonal Spinner - Large)</label>
        <Controller
          name="price"
          control={control}
          render={({ field: { onChange, value, ref } }) => (
            <NumberSpinner
              ref={ref}
              id="price"
              value={value}
              onChange={onChange}
              min={0}
              step={5}
              max={100}
              variant="diagonal"
              scale="md"
            />
          )}
        />
      </div>

      <div className="flex flex-col">
        <label className="form-label">Choose Color</label>
        <Controller
          name="color"
          control={control}
          rules={{ required: 'Please select a color' }}
          render={({ field: { onChange, value } }) => (
            <RadioGroup
              name="color"
              value={value}
              onChange={onChange}
              options={[
                { value: 'red', label: 'red' },
                { value: 'green', label: 'green' },
                { value: 'blue', label: 'blue' }
              ]}
              className="flex gap-4"
            />
          )}
        />
        <FormErrorMessage error={errors.color} />
      </div>


      <div className="flex flex-col">
        <label className="form-label" htmlFor="volume">Volume (with value)</label>
        <Controller
          name="volume"
          control={control}
          render={({ field: { onChange, value, ref } }) => (
            <Slider
              ref={ref}
              id="volume"
              value={value}
              onChange={onChange}
              min={0}
              max={100}
              showValue
              scale="sm"
            />
          )}
        />
      </div>

      <div className="flex flex-col">
        <label className="form-label" htmlFor="brightness">Brightness (with min/max)</label>
        <Controller
          name="brightness"
          control={control}
          render={({ field: { onChange, value, ref } }) => (
            <Slider
              ref={ref}
              id="brightness"
              value={value}
              onChange={onChange}
              min={0}
              max={100}
              showMinMax
              scale="lg"
            />
          )}
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <label className="form-label" htmlFor="notifications">Enable Notifications</label>
          <Controller
            name="notifications"
            control={control}
            render={({ field: { onChange, value, ref } }) => (
              <Switch
                ref={ref}
                id="notifications"
                checked={value}
                onChange={(e) => onChange(e.target.checked)}
              />
            )}
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="form-label" htmlFor="darkMode">Dark Mode</label>
          <Controller
            name="darkMode"
            control={control}
            render={({ field: { onChange, value, ref } }) => (
              <Switch
                ref={ref}
                id="darkMode"
                checked={value}
                onChange={(e) => onChange(e.target.checked)}
                // @ts-ignore
                size="lg"
              />
            )}
          />
        </div>
      </div>

      <div className="flex flex-col">
        <label className="form-label" htmlFor="note">Notes</label>
        <TextArea
          id="note"
          placeholder="Add your notes here..."
          rows={4}
          error={!!errors.note}
          {...register("note", {
            required: "Note is required",
            minLength: { value: 10, message: "Note must be at least 10 characters" }
          })}
        />
        <FormErrorMessage error={errors.note} />
      </div>

      <div className="flex flex-col">
        <label className="form-label">Birthday (with time)</label>
        <Controller
          name="birthday"
          control={control}
          rules={{ required: 'Birthday is required' }}
          render={({ field: { onChange, value } }) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return (
              <InputDatePicker
                value={value}
                onChange={onChange}
                placeholder="Select your birthday"
                error={!!errors.birthday}
                datePickerProps={{
                  minDate: today,
                  showTime: true,
                  timeFormat: "12h"
                }}
                dateFormat={(date) => {
                  if (!date) return '';
                  return date.toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  });
                }}
              />
            );
          }}
        />
        <FormErrorMessage error={errors.birthday} />
      </div>

      <div className="flex flex-col">
        <label className="form-label">Vacation Period (InputDateRangePicker with time & default times 9:00-17:00)</label>
        <Controller
          name="vacationFromDate"
          control={control}
          rules={{ required: 'From date is required' }}
          render={({ field: { onChange: onFromDateChange, value: fromDate } }) => (
            <Controller
              name="vacationToDate"
              control={control}
              render={({ field: { onChange: onToDateChange, value: toDate } }) => (
                <InputDateRangePicker
                  fromDate={fromDate}
                  toDate={toDate}
                  onFromDateChange={onFromDateChange}
                  onToDateChange={onToDateChange}
                  placeholder="Select vacation dates"
                  endIcon={<Calendar size={18} />}
                  defaultStartTime={{ hours: 9, minutes: 0 }}
                  defaultEndTime={{ hours: 17, minutes: 0 }}
                  datePickerProps={{
                    showTime: true,
                    timeFormat: "24h"
                  }}
                  dateFormat={(from, to) => {
                    if (!from && !to) return '';

                    const formatDate = (date: Date | null) => {
                      if (!date) return '';
                      return date.toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: false
                      });
                    };

                    const fromStr = formatDate(from);
                    const toStr = formatDate(to);

                    if (fromStr && toStr) {
                      return `${fromStr} - ${toStr}`;
                    } else if (fromStr) {
                      return fromStr;
                    }
                    return '';
                  }}
                />
              )}
            />
          )}
        />
        <FormErrorMessage error={errors.vacationFromDate || errors.vacationToDate} />
      </div>

      <div className="flex flex-col">
        <label className="form-label">Conference Dates (InputDateRangePicker - no time, with initial value)</label>
        <Controller
          name="conferenceFromDate"
          control={control}
          render={({ field: { onChange: onFromDateChange, value: fromDate } }) => (
            <Controller
              name="conferenceToDate"
              control={control}
              render={({ field: { onChange: onToDateChange, value: toDate } }) => (
                <InputDateRangePicker
                  fromDate={fromDate}
                  toDate={toDate}
                  onFromDateChange={onFromDateChange}
                  onToDateChange={onToDateChange}
                  placeholder="Select conference dates"
                  endIcon={<Calendar size={18} />}
                  datePickerProps={{
                    showTime: false
                  }}
                />
              )}
            />
          )}
        />
        <FormErrorMessage error={errors.conferenceFromDate || errors.conferenceToDate} />
      </div>

      <EdibleSelect control={control} errors={errors}/>

      <LabeledCheckbox label="Subscribe to newsletter" {...register("newsletter")} />

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          type="submit"
          disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
        <Button
          variant="ghost"
          type="button"
          onClick={() => reset()}
          disabled={isSubmitting}
        >
          Reset
        </Button>
        {isSubmitSuccessful && <span className="text-green-500 text-sm">Submitted!</span>}
      </div>

      <div className="border-2 rounded-md bg-surface border-line">
        <JsonPretty data={submitData}/>
      </div>
    </form>
  );
}

const EdibleSelect = ({ control, errors }: { control: any, errors: any }) => {

  const options = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
    { value: 'date', label: 'Date' },
    { value: 'grape-aloe', label: 'Grape-Aloe' },
    { value: 'lemon', label: 'Lemon' },
    { value: 'very-long-name', label: 'Lemon Apple Cherry Banana Date Grape-Aloe Lemon Apple Cherry Banana Date Grape-Aloe' },
  ];

  return (
    <>
      <div className="flex flex-col">
        <label className="form-label">Select one edible</label>
        <Controller
          name="singleEdible"
          control={control}
          rules={{ required: "Please select an edible" }}
          render={({ field: { onChange, value } }) => (
            <Select
              id="fruit-select"
              options={options}
              value={value}
              onChange={onChange}
              placeholder="Select a fruit"
              className="w-full"
              error={!!errors.singleEdible}
              popoverProps={{
                className: 'overflow-y-auto w-full',
                maxHeight: '100px',
                maxWidth: '400px',
              }}
            />
          )}
        />
        <FormErrorMessage error={errors.singleEdible} />
      </div>

      <div className="flex flex-col">
        <label className="form-label">Select at least 2 edibles</label>
        <Controller
          name="multiEdibles"
          control={control}
          rules={{
            validate: (value) => {
              if (!value || value.length < 2) {
                return "Please select at least 2 edibles";
              }
              return true;
            }
          }}
          render={({ field: { onChange, value } }) => (
            <Select
              options={options}
              value={value}
              onChange={onChange}
              multiple
              placeholder="Select multiple fruits"
              error={!!errors.multiEdibles}
            />
          )}
        />
        <FormErrorMessage error={errors.multiEdibles} />
      </div>

      <div className="flex flex-col">
        <label className="form-label">Can't touch this</label>
        <Select
          options={options}
          value={null}
          onChange={() => {}}
          placeholder="This is disabled"
          disabled
        />
      </div>
    </>
  );
};