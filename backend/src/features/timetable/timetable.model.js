import mongoose from 'mongoose';

const { Schema, model } = mongoose;

export const DEFAULT_GHANTAGADI_SCHEDULE = [
  {
    id: 'g1',
    ward_en: 'Ward 1 & 2',
    ward_mr: 'प्रभाग १ व २',
    timingMorning_en: '07:00 AM – 09:00 AM',
    timingMorning_mr: 'सकाळी ०७:०० – ०९:००',
    timingEvening_en: '04:00 PM – 05:30 PM',
    timingEvening_mr: 'संध्याकाळी ०४:०० – ०५:३०',
    days_en: 'Daily (Mon – Sat)',
    days_mr: 'दररोज (सोम – शनि)',
    driverName_en: 'Ramesh Patil',
    driverName_mr: 'रमेश पाटील',
    driverMobile: '9823012345',
    vehicleNo: 'MH-10-GP-1001',
    status_en: 'Active Morning',
    status_mr: 'सकाळची फेरी सुरू',
  },
  {
    id: 'g2',
    ward_en: 'Ward 3 & 4',
    ward_mr: 'प्रभाग ३ व ४',
    timingMorning_en: '09:00 AM – 11:00 AM',
    timingMorning_mr: 'सकाळी ०९:०० – ११:००',
    timingEvening_en: '05:30 PM – 07:00 PM',
    timingEvening_mr: 'संध्याकाळी ०५:३० – ०७:००',
    days_en: 'Daily (Mon – Sat)',
    days_mr: 'दररोज (सोम – शनि)',
    driverName_en: 'Sanjay Deshmukh',
    driverName_mr: 'संजय देशमुख',
    driverMobile: '9823012346',
    vehicleNo: 'MH-10-GP-1002',
    status_en: 'Scheduled',
    status_mr: 'नियोजित',
  },
  {
    id: 'g3',
    ward_en: 'Ward 5 & 6',
    ward_mr: 'प्रभाग ५ व ६',
    timingMorning_en: '07:30 AM – 09:30 AM',
    timingMorning_mr: 'सकाळी ०७:३० – ०९:३०',
    timingEvening_en: '04:30 PM – 06:00 PM',
    timingEvening_mr: 'संध्याकाळी ०४:३० – ०६:००',
    days_en: 'Daily (Mon – Sat)',
    days_mr: 'दररोज (सोम – शनि)',
    driverName_en: 'Vikram Shinde',
    driverName_mr: 'विक्रम शिंदे',
    driverMobile: '9823012347',
    vehicleNo: 'MH-10-GP-1003',
    status_en: 'Active Morning',
    status_mr: 'सकाळची फेरी सुरू',
  },
];

export const DEFAULT_WATER_SCHEDULE = [
  {
    id: 'w1',
    zone_en: 'Ward 1 & 2',
    zone_mr: 'प्रभाग १ व २',
    timing_en: '06:00 AM – 07:30 AM',
    timing_mr: 'सकाळी ०६:०० – ०७:३०',
    frequency_en: 'Daily Morning',
    frequency_mr: 'दररोज सकाळी',
    operatorName_en: 'Suresh More',
    operatorName_mr: 'सुरेश मोरे',
    operatorMobile: '9890123456',
    source_en: 'Main Elevated Reservoir A',
    source_mr: 'मुख्य जलकुंभ अ',
    status_en: 'Active Now',
    status_mr: 'सध्या सुरू',
  },
  {
    id: 'w2',
    zone_en: 'Ward 3 & 4',
    zone_mr: 'प्रभाग ३ व ४',
    timing_en: '07:30 AM – 09:00 AM',
    timing_mr: 'सकाळी ०७:३० – ०९:००',
    frequency_en: 'Daily Morning',
    frequency_mr: 'दररोज सकाळी',
    operatorName_en: 'Prakash Jadhav',
    operatorName_mr: 'प्रकाश जाधव',
    operatorMobile: '9890123457',
    source_en: 'Elevated Reservoir B',
    source_mr: 'जलकुंभ ब',
    status_en: 'Upcoming',
    status_mr: 'आगामी',
  },
  {
    id: 'w3',
    zone_en: 'Ward 5 & 6',
    zone_mr: 'प्रभाग ५ व ६',
    timing_en: '05:00 PM – 06:30 PM',
    timing_mr: 'संध्याकाळी ०५:०० – ०६:३०',
    frequency_en: 'Daily Evening',
    frequency_mr: 'दररोज संध्याकाळी',
    operatorName_en: 'Mahesh Kadam',
    operatorName_mr: 'महेश कदम',
    operatorMobile: '9890123458',
    source_en: 'South Pump House',
    source_mr: 'दक्षिण पंप हाऊस',
    status_en: 'Evening Shift',
    status_mr: 'संध्याकाळची फेरी',
  },
];

const timetableSchema = new Schema(
  {
    key: { type: String, default: 'primary', unique: true, immutable: true },
    ghantagadi: {
      type: Array,
      default: DEFAULT_GHANTAGADI_SCHEDULE,
    },
    water: {
      type: Array,
      default: DEFAULT_WATER_SCHEDULE,
    },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const TimetableModel = model('Timetable', timetableSchema);
