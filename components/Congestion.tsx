import {TrafficLevel} from '../types.ts';

type CongestionProps = {
	level: TrafficLevel;
};

const CONGESTION_TO_LABEL: Record<TrafficLevel, string> = {
	[TrafficLevel.UNCONGESTED]: 'Uncongested',
	[TrafficLevel.LIGHT]: 'Light Congestion',
	[TrafficLevel.MEDIUM]: 'Medium Congestion',
	[TrafficLevel.HEAVY]: 'Heavy Congestion',
	[TrafficLevel.UNKNOWN]: 'Unknown Congestion',
};

const CONGESTION_TO_CLASS: Record<TrafficLevel, string> = {
	[TrafficLevel.UNCONGESTED]: 'bg-blue-100 text-blue-800',
	[TrafficLevel.LIGHT]: 'bg-green-100 text-green-800',
	[TrafficLevel.MEDIUM]: 'bg-yellow-100 text-yellow-800',
	[TrafficLevel.HEAVY]: 'bg-red-100 text-red-800',
	[TrafficLevel.UNKNOWN]: 'bg-gray-100 text-gray-800',
};

const Congestion = ({level}: CongestionProps) => {
	const label = CONGESTION_TO_LABEL[level];
	const className = CONGESTION_TO_CLASS[level];
	const finalClass = `inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium md:mt-2 lg:mt-0 ${className}`;

	return <div className={finalClass}>{label}</div>;
};

export default Congestion;
