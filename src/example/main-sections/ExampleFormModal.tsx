import { useState, useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { Select } from '../../components/Select';
import { InputDateRangePicker } from '../../components/InputDateRangePicker';
import { FormControlError } from '../../components/FormControlError';
import { JsonPretty } from '../../components/JsonPretty';
import { Calendar } from 'lucide-react';


type FormValues = {
  category: string;
  tags: string[];
  eventStartDate: Date | null;
  eventEndDate: Date | null;
};

const categoryOptions = [
  { value: 'technology', label: 'Technology' },
  { value: 'business', label: 'Business' },
  { value: 'health', label: 'Health' },
  { value: 'education', label: 'Education' },
  { value: 'entertainment', label: 'Entertainment' },
];

const tagOptions = [
  { value: 'react', label: 'React' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'nodejs', label: 'Node.js' },
  { value: 'css', label: 'CSS' },
  { value: 'html', label: 'HTML' },
];

export function ExampleFormModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitData, setSubmitData] = useState<any>({});

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
  } = useForm<FormValues>({
    defaultValues: {
      category: '',
      tags: [],
      eventStartDate: null,
      eventEndDate: null,
    },
    mode: "onTouched",
  });

  const onSubmit = useCallback(async (data: FormValues) => {
    await new Promise((r) => setTimeout(r, 500));
    setSubmitData(data);
    console.log("Form submitted:", data);
    setIsModalOpen(false);
    reset();
  }, [reset]);

  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    reset();
  }, [reset]);

  return (
    <div className="page-content">
      <h1 className="heading-1 mb-4">Form Modal Example</h1>

      <Button
        variant="primary"
        onClick={handleOpenModal}
      >
        Open Form Modal
      </Button>

      {submitData && Object.keys(submitData).length > 0 && (
        <div className="mt-4 border-2 rounded-md bg-surface border-line">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-2">Last Submission:</h2>
            <JsonPretty data={submitData} />
          </div>
        </div>
      )}

      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        width="600px"
      >
        <div className="modal-header">
          <h2 className="modal-title">Form Modal</h2>
          <button type="button" className="modal-close-btn" onClick={handleCloseModal} aria-label="Close">×</button>
        </div>
        <div className="modal-content">
          <form id="modal-form" onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="flex flex-col gap-1">
              <label className="form-label">Category</label>
              <Controller
                name="category"
                control={control}
                rules={{ required: "Please select a category" }}
                render={({ field: { onChange, value } }) => (
                  <FormControlError error={errors.category}>
                    <Select
                      options={categoryOptions}
                      value={value}
                      onChange={onChange}
                      placeholder="Select a category"
                      className="w-full"
                    />
                  </FormControlError>
                )}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="form-label">Tags (Select at least 2)</label>
              <Controller
                name="tags"
                control={control}
                rules={{
                  validate: (value) => {
                    if (!value || value.length < 2) {
                      return "Please select at least 2 tags";
                    }
                    return true;
                  }
                }}
                render={({ field: { onChange, value } }) => (
                  <FormControlError error={errors.tags}>
                    <Select
                      options={tagOptions}
                      value={value}
                      onChange={onChange}
                      multiple
                      placeholder="Select multiple tags"
                    />
                  </FormControlError>
                )}
              />
            </div>

            <DateRangeField control={control} errors={errors} />
          </form>
        </div>
        <div className="modal-footer">
          <Button
            variant="ghost"
            type="button"
            onClick={handleCloseModal}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="modal-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

const DateRangeField = ({ control, errors }: { control: any; errors: any }) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="form-label">Event Date Range</label>
      <Controller
        name="eventStartDate"
        control={control}
        rules={{ required: 'Start date is required' }}
        render={({ field: { onChange: onStartDateChange, value: startDate } }) => (
          <Controller
            name="eventEndDate"
            control={control}
            rules={{ required: 'End date is required' }}
            render={({ field: { onChange: onEndDateChange, value: endDate } }) => (
              <InputDateRangePicker
                fromDate={startDate}
                toDate={endDate}
                onFromDateChange={onStartDateChange}
                onToDateChange={onEndDateChange}
                placeholder="Select event date range"
                endIcon={<Calendar size={18} />}
                datePickerProps={{
                  showTime: true,
                  timeFormat: "12h"
                }}
              />
            )}
          />
        )}
      />
      {errors.eventStartDate && <span className="form-error">{errors.eventStartDate.message}</span>}
      {errors.eventEndDate && <span className="form-error">{errors.eventEndDate.message}</span>}
    </div>
  );
};
