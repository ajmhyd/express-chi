type CongestionProps = {
  speed: number;
};
const Congestion = ({ speed }: CongestionProps) => {
  if (speed > 45) {
    return (
      <div className="inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 md:mt-2 lg:mt-0">
        Uncongested
      </div>
    );
  } else if (speed <= 45 && speed > 30) {
    return (
      <div className="inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800 md:mt-2 lg:mt-0">
        Light Congestion
      </div>
    );
  } else if (speed <= 30 && speed > 12) {
    return (
      <div className="inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 md:mt-2 lg:mt-0">
        Medium Congestion
      </div>
    );
  } else if (speed <= 12) {
    return (
      <div className="inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800 md:mt-2 lg:mt-0">
        Heavy Congestion
      </div>
    );
  } else {
    return (
      <div className="inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800 md:mt-2 lg:mt-0">
        Unknown Congestion
      </div>
    );
  }
};

export default Congestion;
