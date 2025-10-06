import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FormControlError } from '../../components/FormControlError';
import { JsonPretty } from '../../components/JsonPretty';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';
import { LabeledCheckbox } from '../../components/LabeledCheckbox';
import { Input } from '../../components/Input';
import "../styles/utils.css";
import { TextArea } from '../../components/TextArea';
import { RadioGroup } from '../../components/RadioGroup';
import { DatePicker } from '../../components/DatePicker';
import { DoubleDatePicker } from '../../components/DoubleDatePicker';
import { NumberSpinner } from '../../components/NumberSpinner';

type FormValues = {
  name: string;
  email: string;
  age?: number | "";
  quantity?: number | "";
  price?: number | "";
  newsletter?: boolean;
  singleEdible: string;
  multiEdibles: string[];
  note: string;
  color: string;
  birthday: Date | null;
  flightFromDate: Date | null;
  flightToDate: Date | null;
  eventPeriodStart: Date | null;
  eventPeriodEnd: Date | null;
};

export function ExampleForm() {
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
      age: "",
      quantity: 5,
      price: 99,
      newsletter: true,
      singleEdible: 'banana',
      multiEdibles: ['apple', 'banana'],
      note: "This is a note.",
      birthday: null,
      flightFromDate: null,
      flightToDate: null,
      eventPeriodStart: null,
      eventPeriodEnd: null,
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 p-card">
      <div className="flex flex-col gap-1">
        <label className="form-label" htmlFor="name">Name</label>
        <FormControlError error={errors.name}>
          <Input
            id="name"
            placeholder="Jane Doe"
            className="form-control"
            {...register("name", {
              required: 'Template name is required (min 3 characters)',
              minLength: {
                value: 3,
                message: 'Template name must be at least 3 characters',
              },
            })}
          />
        </FormControlError>
      </div>

      <div className="flex flex-col gap-1">
        <label className="form-label" htmlFor="email">Email</label>
        <Input
          id="email"
          placeholder="jane@example.com"
          className="form-control"
          {...register("email", {
          required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email",
            },
          })}
        />
        {errors.email && <span className="form-error">{errors.email.message}</span>}
        <div className="form-error">Live email: {email || "—"}</div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="form-label" htmlFor="age">Age</label>
        <Input
          id="age"
          type="number"
          className="form-control"
          {...register("age", {
            setValueAs: (v) => (v === "" ? "" : Number(v)),
            min: { value: 0, message: "Age must be positive" },
          })}
        />
        {errors.age && <span className="form-error">{errors.age.message}</span>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="form-label" htmlFor="quantity">Quantity (NumberSpinner)</label>
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
              error={!!errors.quantity}
            />
          )}
        />
        {errors.quantity && <span className="form-error">{errors.quantity.message}</span>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="form-label" htmlFor="price">Price (Diagonal Spinner)</label>
        <Controller
          name="price"
          control={control}
          rules={{
            required: "Price is required",
            min: { value: 0, message: "Price must be at least 0" },
          }}
          render={({ field: { onChange, value, ref } }) => (
            <NumberSpinner
              ref={ref}
              id="price"
              value={value}
              onChange={onChange}
              min={0}
              step={5}
              variant="diagonal"
              error={!!errors.price}
            />
          )}
        />
        {errors.price && <span className="form-error">{errors.price.message}</span>}
      </div>

      <div className="flex flex-col gap-1">
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
        {errors.color && <span className="form-error">{errors.color.message}</span>}
      </div>


      <div className="flex flex-col gap-1">
        <label className="form-label" htmlFor="note">Notes</label>
        <FormControlError error={errors.note}>
          <TextArea
            id="note"
            placeholder="Add your notes here..."
            className="form-control"
            rows={4}
            {...register("note", {
              required: "Note is required",
              minLength: { value: 10, message: "Note must be at least 10 characters" }
            })}
          />
        </FormControlError>
      </div>

      <div className="flex flex-col gap-1">
        <label className="form-label">Birthday (with time)</label>
        <Controller
          name="birthday"
          control={control}
          rules={{ required: 'Birthday is required' }}
          render={({ field: { onChange, value } }) => (
            <DatePicker
              minDate={new Date()}
              selectedDate={value}
              onChange={onChange}
              className="form-control"
              showTime={true}
              timeFormat="12h"
            />
          )}
        />
        {errors.birthday && <span className="form-error">{errors.birthday.message}</span>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="form-label">Event Period (with time)</label>
        <Controller
          name="eventPeriodStart"
          control={control}
          rules={{ required: 'From date is required' }}
          render={({ field: { onChange: onFromDateChange, value: fromDate } }) => (
            <Controller
              name="eventPeriodEnd"
              control={control}
              rules={{ required: 'To date is required' }}
              render={({ field: { onChange: onToDateChange, value: toDate } }) => (
                <DatePicker
                  mode="range"
                  selectedDate={fromDate}
                  onChange={onFromDateChange}
                  onToDateChange={onToDateChange}
                  toDate={toDate}
                  showTime={true}
                  timeFormat="24h"
                />
              )}
            />
          )}
        />
        {errors.eventPeriodStart && <span className="form-error">{errors.eventPeriodStart.message}</span>}
        {errors.eventPeriodEnd && <span className="form-error">{errors.eventPeriodEnd.message}</span>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="form-label">Flight Dates</label>
        <Controller
          name="flightFromDate"
          control={control}
          rules={{ required: 'From date is required' }}
          render={({ field: { onChange: onFromDateChange, value: fromDate } }) => (
            <Controller
              name="flightToDate"
              control={control}
              rules={{ required: 'To date is required' }}
              render={({ field: { onChange: onToDateChange, value: toDate } }) => (
                <DoubleDatePicker
                  fromDate={fromDate}
                  toDate={toDate}
                  onChange={onFromDateChange}
                  onToDateChange={onToDateChange}
                />
              )}
            />
          )}
        />
        {errors.flightFromDate && <span className="form-error">{errors.flightFromDate.message}</span>}
        {errors.flightToDate && <span className="form-error">{errors.flightToDate.message}</span>}
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
    { value: 'grape', label: 'Grape' },
    { value: 'lemon', label: 'Lemon' },
  ];

  return (
    <>
      <div className="grid gap-1">
        <label className="form-label">Select one edible</label>
        <Controller // Use Controller for react-hook-form integration
          name="singleEdible" // Name of the field in your FormValues
          control={control}
          rules={{ required: "Please select an edible" }} // Validation rule
          render={({ field: { onChange, value } }) => (
            <FormControlError error={errors.singleEdible}>
              <Select
                options={options}
                value={value}
                onChange={onChange} // Use react-hook-form's onChange
                placeholder="Select a fruit"
                className="w-full"
                popoverProps={{
                  className: 'overflow-y-auto w-full',
                  maxHeight: '100px',
                  maxWidth: '400px',
                }}
              />
            </FormControlError>
          )}
        />
      </div>

      <div className="grid gap-1">
        <label className="form-label">Select at least 2 edibles</label>
        <Controller // Use Controller for react-hook-form integration
          name="multiEdibles" // Name of the field in your FormValues
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
              onChange={onChange} // Use react-hook-form's onChange
              multiple
              placeholder="Select multiple fruits"
            />
          )}
        />
        {errors.multiEdibles && <span className="form-error">{errors.multiEdibles.message}</span>} {/* Display error */}
      </div>

      <div className="grid gap-1">
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