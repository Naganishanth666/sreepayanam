import React from 'react';

const NicheTravelFields = ({ tourType, values, onChange }) => {
  if (!tourType) return null;

  // Helper to map snake_case or camelCase key
  const getValue = (snakeName, camelName) => {
    if (values[camelName] !== undefined) return values[camelName];
    if (values[snakeName] !== undefined) return values[snakeName];
    return '';
  };

  const handleChange = (snakeName, camelName, value) => {
    if (values[camelName] !== undefined) {
      onChange(camelName, value);
    } else {
      onChange(snakeName, value);
    }
  };

  const lowerTourType = (tourType || '').toLowerCase();
  const isMice = lowerTourType.includes('mice') || lowerTourType.includes('corporate');
  const isMedical = lowerTourType.includes('medical');
  const isCruise = lowerTourType.includes('cruise');
  const isEducational = lowerTourType.includes('school') || lowerTourType.includes('college') || lowerTourType.includes('education');
  const isHoneymoon = lowerTourType.includes('honeymoon');
  const isPilgrimage = lowerTourType.includes('pilgrimage');

  if (!isMice && !isMedical && !isCruise && !isEducational && !isHoneymoon && !isPilgrimage) {
    return null;
  }

  // Label style
  const lblStyle = {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: '#475569',
    marginBottom: '4px',
    display: 'block'
  };

  const fieldStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  };

  return (
    <div style={{
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '16px',
      marginTop: '12px'
    }}>
      <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        ✨ Special {tourType} Preferences
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        {/* MICE TOURS */}
        {isMice && (
          <>
            <div style={fieldStyle}>
              <label style={lblStyle}>Company / Organization Name *</label>
              <input
                required
                type="text"
                className="input-field"
                placeholder="Enter company name"
                value={getValue('company_name', 'companyName')}
                onChange={e => handleChange('company_name', 'companyName', e.target.value)}
              />
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Event Type *</label>
              <select
                required
                className="input-field"
                value={getValue('event_type', 'eventType')}
                onChange={e => handleChange('event_type', 'eventType', e.target.value)}
              >
                <option value="">Select Event Type</option>
                <option value="Meeting">Meeting</option>
                <option value="Incentive Tour">Incentive Tour</option>
                <option value="Conference">Conference</option>
                <option value="Exhibition">Exhibition</option>
                <option value="Team Building">Team Building</option>
                <option value="Annual Meet">Annual Meet</option>
                <option value="Product Launch">Product Launch</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Event Duration (Days) *</label>
              <input
                required
                type="number"
                min="1"
                className="input-field"
                value={getValue('event_duration_days', 'eventDurationDays')}
                onChange={e => handleChange('event_duration_days', 'eventDurationDays', e.target.value)}
              />
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Venue Preference</label>
              <select
                className="input-field"
                value={getValue('venue_preference', 'venuePreference')}
                onChange={e => handleChange('venue_preference', 'venuePreference', e.target.value)}
              >
                <option value="">Select Venue Preference</option>
                <option value="Hotel Conference Hall">Hotel Conference Hall</option>
                <option value="Convention Center">Convention Center</option>
                <option value="Resort">Resort</option>
                <option value="Outdoor">Outdoor</option>
                <option value="Cruise">Cruise</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Room Occupancy</label>
              <select
                className="input-field"
                value={getValue('room_occupancy', 'roomOccupancy')}
                onChange={e => handleChange('room_occupancy', 'roomOccupancy', e.target.value)}
              >
                <option value="">Select Room Occupancy</option>
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Triple">Triple</option>
                <option value="Twin Sharing">Twin Sharing</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Meeting Room Required?</label>
              <select
                className="input-field"
                value={getValue('meeting_room_required', 'meetingRoomRequired')}
                onChange={e => handleChange('meeting_room_required', 'meetingRoomRequired', e.target.value)}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Audio Visual Required?</label>
              <select
                className="input-field"
                value={getValue('audio_visual_required', 'audioVisualRequired')}
                onChange={e => handleChange('audio_visual_required', 'audioVisualRequired', e.target.value)}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Team Building Activities?</label>
              <select
                className="input-field"
                value={getValue('team_building_activities', 'teamBuildingActivities')}
                onChange={e => handleChange('team_building_activities', 'teamBuildingActivities', e.target.value)}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Gala Dinner Required?</label>
              <select
                className="input-field"
                value={getValue('gala_dinner_required', 'galaDinnerRequired')}
                onChange={e => handleChange('gala_dinner_required', 'galaDinnerRequired', e.target.value)}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Approximate Pax *</label>
              <input
                required
                type="number"
                min="1"
                className="input-field"
                value={getValue('approximate_pax', 'approximatePax')}
                onChange={e => handleChange('approximate_pax', 'approximatePax', e.target.value)}
              />
            </div>
          </>
        )}

        {/* MEDICAL TOURS */}
        {isMedical && (
          <>
            <div style={fieldStyle}>
              <label style={lblStyle}>Patient Name *</label>
              <input
                required
                type="text"
                className="input-field"
                placeholder="Enter patient name"
                value={getValue('patient_name', 'patientName')}
                onChange={e => handleChange('patient_name', 'patientName', e.target.value)}
              />
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Age *</label>
              <input
                required
                type="number"
                min="1"
                className="input-field"
                value={getValue('age', 'patientAge')}
                onChange={e => handleChange('age', 'patientAge', e.target.value)}
              />
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Gender *</label>
              <select
                required
                className="input-field"
                value={getValue('gender', 'patientGender')}
                onChange={e => handleChange('gender', 'patientGender', e.target.value)}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Medical Condition *</label>
              <input
                required
                type="text"
                className="input-field"
                placeholder="e.g. Heart surgery, Dental checkup"
                value={getValue('medical_condition', 'medicalCondition')}
                onChange={e => handleChange('medical_condition', 'medicalCondition', e.target.value)}
              />
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Preferred Country *</label>
              <select
                required
                className="input-field"
                value={getValue('preferred_treatment_country', 'preferredTreatmentCountry')}
                onChange={e => handleChange('preferred_treatment_country', 'preferredTreatmentCountry', e.target.value)}
              >
                <option value="">Select Country</option>
                <option value="India">India</option>
                <option value="Thailand">Thailand</option>
                <option value="Singapore">Singapore</option>
                <option value="Malaysia">Malaysia</option>
                <option value="Germany">Germany</option>
                <option value="Turkey">Turkey</option>
                <option value="UAE">UAE</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Treatment Category *</label>
              <select
                required
                className="input-field"
                value={getValue('treatment_category', 'treatmentCategory')}
                onChange={e => handleChange('treatment_category', 'treatmentCategory', e.target.value)}
              >
                <option value="">Select Category</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Oncology">Oncology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Neurology">Neurology</option>
                <option value="Dental">Dental</option>
                <option value="Cosmetic">Cosmetic</option>
                <option value="Health Checkup">Health Checkup</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Hospital Preference</label>
              <select
                className="input-field"
                value={getValue('hospital_preference', 'hospitalPreference')}
                onChange={e => handleChange('hospital_preference', 'hospitalPreference', e.target.value)}
              >
                <option value="">Select Hospital</option>
                <option value="Apollo">Apollo</option>
                <option value="Fortis">Fortis</option>
                <option value="Max">Max</option>
                <option value="Gleneagles">Gleneagles</option>
                <option value="Bumrungrad">Bumrungrad</option>
                <option value="Mount Elizabeth">Mount Elizabeth</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Visa Assistance Required?</label>
              <select
                className="input-field"
                value={getValue('visa_assistance_required', 'visaAssistanceRequired')}
                onChange={e => handleChange('visa_assistance_required', 'visaAssistanceRequired', e.target.value)}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Translator Required?</label>
              <select
                className="input-field"
                value={getValue('translator_required', 'translatorRequired')}
                onChange={e => handleChange('translator_required', 'translatorRequired', e.target.value)}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Accommodation for Attendants?</label>
              <select
                className="input-field"
                value={getValue('accommodation_for_attendants', 'accommodationForAttendants')}
                onChange={e => handleChange('accommodation_for_attendants', 'accommodationForAttendants', e.target.value)}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Wheelchair Assistance?</label>
              <select
                className="input-field"
                value={getValue('wheelchair_assistance', 'wheelchairAssistance')}
                onChange={e => handleChange('wheelchair_assistance', 'wheelchairAssistance', e.target.value)}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div style={{ ...fieldStyle, gridColumn: 'span 2' }}>
              <label style={lblStyle}>Medical History / Details</label>
              <textarea
                className="input-field"
                rows="2"
                style={{ padding: '8px' }}
                placeholder="Enter brief details of medical history or requirements"
                value={getValue('medical_history_details', 'medicalHistoryDetails')}
                onChange={e => handleChange('medical_history_details', 'medicalHistoryDetails', e.target.value)}
              />
            </div>
          </>
        )}

        {/* CRUISE PACKAGES */}
        {isCruise && (
          <>
            <div style={fieldStyle}>
              <label style={lblStyle}>Cruise Line Preference *</label>
              <select
                required
                className="input-field"
                value={getValue('cruise_line_preference', 'cruiseLinePreference')}
                onChange={e => handleChange('cruise_line_preference', 'cruiseLinePreference', e.target.value)}
              >
                <option value="">Select Cruise Line</option>
                <option value="Royal Caribbean">Royal Caribbean</option>
                <option value="Costa Cruises">Costa Cruises</option>
                <option value="Cordelia Cruises">Cordelia Cruises</option>
                <option value="MSC Cruises">MSC Cruises</option>
                <option value="Norwegian Cruise Line">Norwegian Cruise Line</option>
                <option value="Princess Cruises">Princess Cruises</option>
                <option value="Genting Dream">Genting Dream</option>
                <option value="Singapore Cruises">Singapore Cruises</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Cabin Category Preference *</label>
              <select
                required
                className="input-field"
                value={getValue('cabin_category', 'cabinCategory')}
                onChange={e => handleChange('cabin_category', 'cabinCategory', e.target.value)}
              >
                <option value="">Select Cabin Category</option>
                <option value="Interior Cabin">Interior Cabin</option>
                <option value="Oceanview Cabin">Oceanview Cabin</option>
                <option value="Balcony Cabin">Balcony Cabin</option>
                <option value="Suite">Suite</option>
                <option value="Luxury Suite">Luxury Suite</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Destination Cruise *</label>
              <select
                required
                className="input-field"
                value={getValue('destination_cruise', 'destinationCruise')}
                onChange={e => handleChange('destination_cruise', 'destinationCruise', e.target.value)}
              >
                <option value="">Select Destination</option>
                <option value="Singapore-Malaysia">Singapore-Malaysia</option>
                <option value="Europe-Mediterranean">Europe-Mediterranean</option>
                <option value="Caribbean">Caribbean</option>
                <option value="Alaska">Alaska</option>
                <option value="India Domestic">India Domestic</option>
                <option value="Dubai-Gulf">Dubai-Gulf</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Duration Nights *</label>
              <input
                required
                type="number"
                min="1"
                className="input-field"
                value={getValue('duration_nights', 'durationNights')}
                onChange={e => handleChange('duration_nights', 'durationNights', e.target.value)}
              />
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Shore Excursions Required?</label>
              <select
                className="input-field"
                value={getValue('shore_excursions', 'shoreExcursions')}
                onChange={e => handleChange('shore_excursions', 'shoreExcursions', e.target.value)}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Dining Preference</label>
              <select
                className="input-field"
                value={getValue('dining_preference', 'diningPreference')}
                onChange={e => handleChange('dining_preference', 'diningPreference', e.target.value)}
              >
                <option value="">Select Dining</option>
                <option value="Main Dining Room">Main Dining Room</option>
                <option value="Buffet">Buffet</option>
                <option value="Specialty Dining">Specialty Dining</option>
                <option value="Halal">Halal</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Jain">Jain</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Onboard Gratuities Prepaid?</label>
              <select
                className="input-field"
                value={getValue('onboard_gratuities_prepaid', 'onboardGratuitiesPrepaid')}
                onChange={e => handleChange('onboard_gratuities_prepaid', 'onboardGratuitiesPrepaid', e.target.value)}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </>
        )}

        {/* EDUCATIONAL TOURS */}
        {isEducational && (
          <>
            <div style={fieldStyle}>
              <label style={lblStyle}>Institution Name *</label>
              <input
                required
                type="text"
                className="input-field"
                placeholder="Enter school or college name"
                value={getValue('institution_name', 'institutionName')}
                onChange={e => handleChange('institution_name', 'institutionName', e.target.value)}
              />
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Department / Grade / Standard *</label>
              <input
                required
                type="text"
                className="input-field"
                placeholder="e.g. B.Sc Physics, Grade 10"
                value={getValue('department_grade', 'departmentGrade')}
                onChange={e => handleChange('department_grade', 'departmentGrade', e.target.value)}
              />
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Contact Person Designation</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Principal, HOD, Teacher"
                value={getValue('contact_person_designation', 'contactPersonDesignation')}
                onChange={e => handleChange('contact_person_designation', 'contactPersonDesignation', e.target.value)}
              />
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Number of Students *</label>
              <input
                required
                type="number"
                min="1"
                className="input-field"
                value={getValue('number_of_students', 'numberOfStudents')}
                onChange={e => handleChange('number_of_students', 'numberOfStudents', e.target.value)}
              />
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Number of Teachers / Escorts *</label>
              <input
                required
                type="number"
                min="1"
                className="input-field"
                value={getValue('number_of_teachers', 'numberOfTeachers')}
                onChange={e => handleChange('number_of_teachers', 'numberOfTeachers', e.target.value)}
              />
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Study Subject / Focus Area</label>
              <select
                className="input-field"
                value={getValue('study_subject_focus', 'studySubjectFocus')}
                onChange={e => handleChange('study_subject_focus', 'studySubjectFocus', e.target.value)}
              >
                <option value="">Select Focus Area</option>
                <option value="Science">Science</option>
                <option value="History">History</option>
                <option value="Geography">Geography</option>
                <option value="Business">Business</option>
                <option value="Culture">Culture</option>
                <option value="Industrial Visit">Industrial Visit</option>
                <option value="Adventure">Adventure</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Industrial Visit Required?</label>
              <select
                className="input-field"
                value={getValue('industrial_visit_required', 'industrialVisitRequired')}
                onChange={e => handleChange('industrial_visit_required', 'industrialVisitRequired', e.target.value)}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Guide / Lecture Required?</label>
              <select
                className="input-field"
                value={getValue('guide_lecture_required', 'guideLectureRequired')}
                onChange={e => handleChange('guide_lecture_required', 'guideLectureRequired', e.target.value)}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Certificate Required?</label>
              <select
                className="input-field"
                value={getValue('certificate_of_participation', 'certificateOfParticipation')}
                onChange={e => handleChange('certificate_of_participation', 'certificateOfParticipation', e.target.value)}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Supervisor Room Sharing</label>
              <select
                className="input-field"
                value={getValue('supervisor_accommodation_sharing', 'supervisorAccommodationSharing')}
                onChange={e => handleChange('supervisor_accommodation_sharing', 'supervisorAccommodationSharing', e.target.value)}
              >
                <option value="Twin Sharing">Twin Sharing</option>
                <option value="Single">Single</option>
              </select>
            </div>
          </>
        )}

        {/* HONEYMOON TOURS */}
        {isHoneymoon && (
          <>
            <div style={{ ...fieldStyle, gridColumn: 'span 2' }}>
              <label style={lblStyle}>Couple Names *</label>
              <input
                required
                type="text"
                className="input-field"
                placeholder="Enter names of the couple"
                value={getValue('couple_names', 'coupleNames')}
                onChange={e => handleChange('couple_names', 'coupleNames', e.target.value)}
              />
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Marriage Date *</label>
              <input
                required
                type="date"
                className="input-field"
                value={getValue('marriage_date', 'marriageDate')}
                onChange={e => handleChange('marriage_date', 'marriageDate', e.target.value)}
              />
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Honeymoon Theme / Vibe *</label>
              <select
                required
                className="input-field"
                value={getValue('honeymoon_theme', 'honeymoonTheme')}
                onChange={e => handleChange('honeymoon_theme', 'honeymoonTheme', e.target.value)}
              >
                <option value="">Select Theme</option>
                <option value="Beach">Beach</option>
                <option value="Hill Station">Hill Station</option>
                <option value="Adventure">Adventure</option>
                <option value="Luxury">Luxury</option>
                <option value="Wildlife">Wildlife</option>
                <option value="Heritage">Heritage</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Room View Preference</label>
              <select
                className="input-field"
                value={getValue('room_view_preference', 'roomViewPreference')}
                onChange={e => handleChange('room_view_preference', 'roomViewPreference', e.target.value)}
              >
                <option value="">Select View</option>
                <option value="Sea View">Sea View</option>
                <option value="Mountain View">Mountain View</option>
                <option value="Pool View">Pool View</option>
                <option value="Garden View">Garden View</option>
                <option value="Valley View">Valley View</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Private Pool Villa?</label>
              <select
                className="input-field"
                value={getValue('private_pool_villa', 'privatePoolVilla')}
                onChange={e => handleChange('private_pool_villa', 'privatePoolVilla', e.target.value)}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Photography Service Required?</label>
              <select
                className="input-field"
                value={getValue('photography_service', 'photographyService')}
                onChange={e => handleChange('photography_service', 'photographyService', e.target.value)}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div style={{ ...fieldStyle, gridColumn: 'span 2' }}>
              <label style={lblStyle}>Complimentary Honeymoon Benefits</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '6px' }}>
                {["Bed Decoration", "Candle Light Dinner", "Honeymoon Cake", "Flower Bouquet", "Spa Session", "Fruit Basket", "Wine Bottle"].map(benefit => {
                  const currentList = getValue('complimentary_benifits', 'complimentaryBenefits') || [];
                  const checked = currentList.includes(benefit);
                  const handleCheck = () => {
                    const newList = checked
                      ? currentList.filter(b => b !== benefit)
                      : [...currentList, benefit];
                    handleChange('complimentary_benifits', 'complimentaryBenefits', newList);
                  };
                  return (
                    <label key={benefit} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', cursor: 'pointer', color: '#475569' }}>
                      <input type="checkbox" checked={checked} onChange={handleCheck} style={{ width: '14px', height: '14px' }} />
                      {benefit}
                    </label>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* PILGRIMAGE TOURS */}
        {isPilgrimage && (
          <>
            <div style={fieldStyle}>
              <label style={lblStyle}>Deity / Temple Name *</label>
              <input
                required
                type="text"
                className="input-field"
                placeholder="e.g. Lord Venkateswara"
                value={getValue('deity_temple_name', 'deityTempleName')}
                onChange={e => handleChange('deity_temple_name', 'deityTempleName', e.target.value)}
              />
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Primary Destination *</label>
              <select
                required
                className="input-field"
                value={getValue('primary_destination', 'primaryDestination')}
                onChange={e => handleChange('primary_destination', 'primaryDestination', e.target.value)}
              >
                <option value="">Select Destination</option>
                <option value="Chardham">Chardham</option>
                <option value="Varanasi">Varanasi</option>
                <option value="Tirupati">Tirupati</option>
                <option value="Sabarimala">Sabarimala</option>
                <option value="Vaishno Devi">Vaishno Devi</option>
                <option value="Hajj/Umrah">Hajj/Umrah</option>
                <option value="Vatican">Vatican</option>
                <option value="Buddhist Circuit">Buddhist Circuit</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Special Darshan Passes?</label>
              <select
                className="input-field"
                value={getValue('special_darshan_passes', 'specialDarshanPasses')}
                onChange={e => handleChange('special_darshan_passes', 'specialDarshanPasses', e.target.value)}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Ritual Pooja Arrangements?</label>
              <select
                className="input-field"
                value={getValue('ritual_pooja_arrangements', 'ritualPoojaArrangements')}
                onChange={e => handleChange('ritual_pooja_arrangements', 'ritualPoojaArrangements', e.target.value)}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Senior Citizen Assistance?</label>
              <select
                className="input-field"
                value={getValue('senior_citizen_assistance', 'seniorCitizenAssistance')}
                onChange={e => handleChange('senior_citizen_assistance', 'seniorCitizenAssistance', e.target.value)}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Vegetarian / Jain Food</label>
              <select
                className="input-field"
                value={getValue('vegetarian_jain_food', 'vegetarianJainFood')}
                onChange={e => handleChange('vegetarian_jain_food', 'vegetarianJainFood', e.target.value)}
              >
                <option value="Standard">Standard Veg / Non-Veg</option>
                <option value="Pure Vegetarian">Pure Vegetarian</option>
                <option value="Jain Food">Jain Food</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Physical Disability Assistance</label>
              <select
                className="input-field"
                value={getValue('physical_disability_assistance', 'physicalDisabilityAssistance')}
                onChange={e => handleChange('physical_disability_assistance', 'physicalDisabilityAssistance', e.target.value)}
              >
                <option value="None">None</option>
                <option value="Wheelchair">Wheelchair</option>
                <option value="Doli/Palanquin">Doli/Palanquin</option>
                <option value="Helicopter">Helicopter</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={lblStyle}>Accept Dress Code? *</label>
              <select
                required
                className="input-field"
                value={getValue('dress_code_guidelines_accepted', 'dressCodeGuidelinesAccepted')}
                onChange={e => handleChange('dress_code_guidelines_accepted', 'dressCodeGuidelinesAccepted', e.target.value)}
              >
                <option value="No">No</option>
                <option value="Yes">Yes (I Accept)</option>
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NicheTravelFields;
