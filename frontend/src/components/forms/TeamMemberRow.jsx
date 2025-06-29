import React from 'react';
import IconDrag from '../../assets/icon-drag.svg?react';
import IconTrash from '../../assets/icon-trash.svg?react';
// import TeamMemberAutocomplete from '../TeamMemberAutocomplete.jsx';

const TeamMemberRow = ({ register, onRemove, fieldKey }) => {
  return (
    <div className="team-member-row">
      <IconDrag className="icon-drag" />
      {/*<TeamMemberAutocomplete/>*/}
      <input {...register(fieldKey + '.name')} placeholder="Nombre" type="text" />
      <input {...register(fieldKey + '.nickname')} placeholder="Alias" type="text" />
      <input
        {...register(fieldKey + '.jerseyNo')}
        placeholder="No. Jersey"
        type="number"
        step={1}
        min={0}
        defaultValue={0}
      />
      <button className="plain" onClick={onRemove}>
        <IconTrash className="icon-trash" />
      </button>
    </div>
  );
};

export default TeamMemberRow;
