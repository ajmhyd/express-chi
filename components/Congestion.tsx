import {TrafficLevel} from '../types.ts';

type CongestionProps = {
	level: TrafficLevel | null;
};

const CONGESTION_TO_LABEL: Record<TrafficLevel, string> = {
	[TrafficLevel.Uncongested]: 'Uncongested',
	[TrafficLevel.Light]: 'Light Congestion',
	[TrafficLevel.Medium]: 'Medium Congestion',
	[TrafficLevel.Heavy]: 'Heavy Congestion',
	[TrafficLevel.Unknown]: 'Unknown Congestion',
};

const CONGESTION_TO_CLASS: Record<TrafficLevel, string> = {
	[TrafficLevel.Uncongested]: 'bg-blue-100 text-blue-800',
	[TrafficLevel.Light]: 'bg-green-100 text-green-800',
	[TrafficLevel.Medium]: 'bg-yellow-100 text-yellow-800',
	[TrafficLevel.Heavy]: 'bg-red-100 text-red-800',
	[TrafficLevel.Unknown]: 'bg-gray-100 text-gray-800',
};

export const Congestion = ({level}: CongestionProps) => {
	if (level === null) return null;

	const label = CONGESTION_TO_LABEL[level];
	const className = CONGESTION_TO_CLASS[level];
	const finalClass = `inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium md:mt-2 lg:mt-0 ${className}`;

	return <div className={finalClass}>{label}</div>;
};

const getDifferenceLabel = (difference: number) => {
	if (difference > 0) {
		return `${difference}\u00A0MPH faster than Local`;
	} else if (difference < 0) {
		return `${-difference}\u00A0MPH slower than Local`;
	}

	return 'Same as Local';
};

const getDifferenceClass = (difference: number) => {
	if (Math.abs(difference) <= 1) {
		return 'bg-blue-100 text-blue-800';
	} else if (difference > 0) {
		return 'bg-green-100 text-green-800';
	} else {
		return 'bg-red-100 text-red-800';
	}
};

export const LocalComparison = ({
	express,
	local,
}: {
	express: number | null;
	local: number | null;
}) => {
	if (express === null || local === null) return null;

	const difference = express - local;
	const color = getDifferenceClass(difference);
	const label = getDifferenceLabel(difference);

	return (
		<div
			className={`inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium md:mt-2 lg:mt-0 ${color}`}
		>
			{label}
		</div>
	);
};

export default Congestion;
