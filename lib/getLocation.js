export const fetchUserLocation = async () => {
  if ("geolocation" in navigator) {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      // Fetch the location data from OpenCage API
      const response = await fetch(
        `https://api-bdc.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error("Failed to fetch location data");
      }
      const {countryName,locality,principalSubdivision}=data

      return {
        countryName,
        locality,
        principalSubdivision
      };
    } catch (error) {
      throw new Error(error.message || "Error fetching location data.");
    }
  } else {
    throw new Error("Geolocation is not supported by this browser.");
  }
};
