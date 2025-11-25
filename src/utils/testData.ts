export const destinations = {
    domestic: {
        delhi: { city: 'Delhi', code: 'DEL', country: 'India' },
        mumbai: { city: 'Mumbai', code: 'BOM', country: 'India' },
        bangalore: { city: 'Bangalore', code: 'BLR', country: 'India' },
        hyderabad: { city: 'Hyderabad', code: 'HYD', country: 'India' },
        kolkata: { city: 'Kolkata', code: 'CCU', country: 'India' },
        pune: { city: 'Pune', code: 'PNQ', country: 'India' },
    },
    international: {
        dubai: { city: 'Dubai', code: 'DXB', country: 'UAE' },
        singapore: { city: 'Singapore', code: 'SIN', country: 'Singapore' },
        bangkok: { city: 'Bangkok', code: 'BKK', country: 'Thailand' },
        london: { city: 'London', code: 'LHR', country: 'UK' },
        newyork: { city: 'New York', code: 'JFK', country: 'USA' },
    },
};

export const passengerDetails = {
    adult: {
        firstName: 'Raj',
        lastName: 'Kumar',
        email: 'raj.kumar@automation.com',
        phone: '9876543210',
        age: 35,
        gender: 'Male',
    },
    child: {
        firstName: 'Aisha',
        lastName: 'Kumar',
        email: 'aisha.kumar@automation.com',
        phone: '9876543211',
        age: 8,
        gender: 'Female',
    },
};

export const travelersData = [
    {
        firstName: 'Amit',
        lastName: 'Singh',
        age: 30,
        gender: 'Male',
    },
    {
        firstName: 'Priya',
        lastName: 'Sharma',
        age: 28,
        gender: 'Female',
    },
];

export const testUrls = {
    homepage: 'https://www.makemytrip.com',
    flights: 'https://www.makemytrip.com/flights/',
    hotels: 'https://www.makemytrip.com/hotels/',
    holidays: 'https://www.makemytrip.com/holidays/',
    trains: 'https://www.makemytrip.com/trains/',
};

export const timeouts = {
    short: 5000,
    medium: 10000,
    long: 30000,
    extraLong: 60000,
};

export const searchFilters = {
    stops: ['Non Stop', '1 Stop', '2+ Stops'],
    airlines: ['Air India', 'IndiGo', 'SpiceJet', 'Vistara'],
    classes: ['Economy', 'Premium Economy', 'Business', 'First Class'],
};

export const bookingData = {
    mealPreference: 'Non Vegetarian',
    seatPreference: 'Aisle',
    specialRequest: 'Wheelchair Required',
};