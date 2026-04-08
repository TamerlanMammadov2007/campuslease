import React from "react"
import { motion } from "framer-motion"
import { GoogleMap, OverlayView, InfoWindow, useLoadScript } from "@react-google-maps/api"
import { Link } from "react-router-dom"
import { Bed, Bath, MapPin, X } from "lucide-react"

import { Breadcrumb } from "@/components/Breadcrumb"
import { CompareBar } from "@/components/properties/CompareBar"
import { PropertyFilters } from "@/components/properties/PropertyFilters"
import type { PropertyFiltersState } from "@/components/properties/PropertyFilters"
import { PropertyCard } from "@/components/properties/PropertyCard"
import { PropertyGridSkeleton } from "@/components/skeletons/PropertyCardSkeleton"
import { useProperties } from "@/hooks/useProperties"

const defaultFilters: PropertyFiltersState = {
  query: "",
  university: "",
  type: "",
  bedrooms: "",
  bathrooms: "",
  minPrice: 500,
  maxPrice: 3000,
  furnished: false,
  pets: false,
  parking: false,
  amenities: [],
}

const defaultImage =
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=600&auto=format&fit=crop"

// Known university coordinates — partial matches work (e.g. "georgia tech" matches)
const UNIVERSITY_COORDS: { keywords: string[]; coords: { lat: number; lng: number }; zoom: number }[] = [
  // Georgia
  { keywords: ["georgia tech", "georgia institute of technology", "git atlanta"], coords: { lat: 33.7756, lng: -84.3963 }, zoom: 15 },
  { keywords: ["university of georgia", "uga", "georgia bulldogs"], coords: { lat: 33.9480, lng: -83.3774 }, zoom: 15 },
  { keywords: ["emory"], coords: { lat: 33.7940, lng: -84.3248 }, zoom: 15 },
  { keywords: ["georgia state", "gsu atlanta"], coords: { lat: 33.7530, lng: -84.3857 }, zoom: 15 },
  { keywords: ["kennesaw state", "ksu marietta"], coords: { lat: 34.0381, lng: -84.5819 }, zoom: 15 },
  { keywords: ["mercer university", "mercer macon"], coords: { lat: 32.8367, lng: -83.6483 }, zoom: 15 },
  { keywords: ["morehouse college", "morehouse"], coords: { lat: 33.7484, lng: -84.4143 }, zoom: 15 },
  { keywords: ["spelman college", "spelman"], coords: { lat: 33.7472, lng: -84.4130 }, zoom: 15 },
  { keywords: ["clark atlanta", "cau"], coords: { lat: 33.7494, lng: -84.4133 }, zoom: 15 },
  // Texas
  { keywords: ["ut austin", "university of texas at austin", "texas austin", "longhorns"], coords: { lat: 30.2849, lng: -97.7341 }, zoom: 15 },
  { keywords: ["texas a&m", "texas a and m", "tamu", "aggies college station"], coords: { lat: 30.6187, lng: -96.3365 }, zoom: 15 },
  { keywords: ["rice university", "rice houston"], coords: { lat: 29.7174, lng: -95.4018 }, zoom: 15 },
  { keywords: ["university of houston", "uh houston", "houston cougars"], coords: { lat: 29.7199, lng: -95.3422 }, zoom: 15 },
  { keywords: ["baylor university", "baylor waco"], coords: { lat: 31.5489, lng: -97.1131 }, zoom: 15 },
  { keywords: ["tcu", "texas christian", "horned frogs"], coords: { lat: 32.7096, lng: -97.3628 }, zoom: 15 },
  { keywords: ["smu", "southern methodist", "smu dallas"], coords: { lat: 32.8414, lng: -96.7840 }, zoom: 15 },
  { keywords: ["texas tech", "ttu lubbock"], coords: { lat: 33.5843, lng: -101.8783 }, zoom: 15 },
  { keywords: ["university of north texas", "unt denton"], coords: { lat: 33.2109, lng: -97.1472 }, zoom: 15 },
  { keywords: ["ut dallas", "university of texas dallas", "utd"], coords: { lat: 32.9886, lng: -96.7502 }, zoom: 15 },
  { keywords: ["ut san antonio", "utsa"], coords: { lat: 29.5849, lng: -98.6204 }, zoom: 15 },
  { keywords: ["trinity university san antonio", "trinity san antonio"], coords: { lat: 29.7943, lng: -98.4856 }, zoom: 15 },
  // California
  { keywords: ["ucla", "uc los angeles", "california los angeles", "bruins"], coords: { lat: 34.0689, lng: -118.4452 }, zoom: 15 },
  { keywords: ["usc", "university of southern california", "trojans la"], coords: { lat: 34.0224, lng: -118.2851 }, zoom: 15 },
  { keywords: ["uc berkeley", "berkeley", "cal berkeley", "ucb"], coords: { lat: 37.8724, lng: -122.2595 }, zoom: 15 },
  { keywords: ["stanford"], coords: { lat: 37.4275, lng: -122.1697 }, zoom: 15 },
  { keywords: ["uc san diego", "ucsd", "tritons"], coords: { lat: 32.8801, lng: -117.2340 }, zoom: 15 },
  { keywords: ["uc davis", "ucd davis"], coords: { lat: 38.5382, lng: -121.7617 }, zoom: 15 },
  { keywords: ["uc santa barbara", "ucsb"], coords: { lat: 34.4140, lng: -119.8489 }, zoom: 15 },
  { keywords: ["uc irvine", "uci"], coords: { lat: 33.6405, lng: -117.8443 }, zoom: 15 },
  { keywords: ["uc santa cruz", "ucsc"], coords: { lat: 36.9905, lng: -122.0584 }, zoom: 15 },
  { keywords: ["uc riverside", "ucr"], coords: { lat: 33.9737, lng: -117.3281 }, zoom: 15 },
  { keywords: ["caltech", "california institute of technology"], coords: { lat: 34.1377, lng: -118.1253 }, zoom: 15 },
  { keywords: ["san diego state", "sdsu"], coords: { lat: 32.7757, lng: -117.0719 }, zoom: 15 },
  { keywords: ["cal poly slo", "cal poly san luis obispo"], coords: { lat: 35.3002, lng: -120.6625 }, zoom: 15 },
  { keywords: ["san jose state", "sjsu"], coords: { lat: 37.3352, lng: -121.8811 }, zoom: 15 },
  { keywords: ["fresno state", "csuf", "california state fresno"], coords: { lat: 36.8124, lng: -119.7472 }, zoom: 15 },
  { keywords: ["pepperdine"], coords: { lat: 34.0362, lng: -118.7091 }, zoom: 15 },
  { keywords: ["loyola marymount", "lmu los angeles"], coords: { lat: 33.9692, lng: -118.4164 }, zoom: 15 },
  { keywords: ["university of san francisco", "usf san francisco"], coords: { lat: 37.7766, lng: -122.4511 }, zoom: 15 },
  { keywords: ["santa clara university", "scu"], coords: { lat: 37.3496, lng: -121.9390 }, zoom: 15 },
  // New York
  { keywords: ["nyu", "new york university"], coords: { lat: 40.7295, lng: -73.9965 }, zoom: 15 },
  { keywords: ["columbia university", "columbia new york"], coords: { lat: 40.8075, lng: -73.9626 }, zoom: 15 },
  { keywords: ["cornell"], coords: { lat: 42.4534, lng: -76.4735 }, zoom: 15 },
  { keywords: ["fordham"], coords: { lat: 40.8618, lng: -73.8855 }, zoom: 15 },
  { keywords: ["stony brook", "suny stony brook"], coords: { lat: 40.9146, lng: -73.1229 }, zoom: 15 },
  { keywords: ["university at buffalo", "ub buffalo", "suny buffalo"], coords: { lat: 43.0026, lng: -78.7891 }, zoom: 15 },
  { keywords: ["rensselaer", "rpi troy"], coords: { lat: 42.7298, lng: -73.6784 }, zoom: 15 },
  { keywords: ["rochester", "university of rochester"], coords: { lat: 43.1281, lng: -77.6280 }, zoom: 15 },
  { keywords: ["syracuse"], coords: { lat: 43.0370, lng: -76.1356 }, zoom: 15 },
  { keywords: ["city university of new york", "cuny"], coords: { lat: 40.7486, lng: -73.9840 }, zoom: 14 },
  { keywords: ["new school"], coords: { lat: 40.7357, lng: -74.0001 }, zoom: 15 },
  // Massachusetts
  { keywords: ["harvard"], coords: { lat: 42.3770, lng: -71.1167 }, zoom: 15 },
  { keywords: ["mit", "massachusetts institute of technology"], coords: { lat: 42.3601, lng: -71.0942 }, zoom: 15 },
  { keywords: ["boston university", "bu boston"], coords: { lat: 42.3505, lng: -71.1054 }, zoom: 15 },
  { keywords: ["northeastern university", "northeastern boston"], coords: { lat: 42.3398, lng: -71.0892 }, zoom: 15 },
  { keywords: ["boston college", "bc chestnut hill"], coords: { lat: 42.3355, lng: -71.1685 }, zoom: 15 },
  { keywords: ["tufts university", "tufts medford"], coords: { lat: 42.4075, lng: -71.1190 }, zoom: 15 },
  { keywords: ["umass amherst", "university of massachusetts amherst"], coords: { lat: 42.3868, lng: -72.5301 }, zoom: 15 },
  { keywords: ["worcester polytechnic", "wpi"], coords: { lat: 42.2747, lng: -71.8060 }, zoom: 15 },
  { keywords: ["brandeis"], coords: { lat: 42.3672, lng: -71.2617 }, zoom: 15 },
  { keywords: ["wellesley"], coords: { lat: 42.2958, lng: -71.3059 }, zoom: 15 },
  { keywords: ["amherst college", "amherst"], coords: { lat: 42.3712, lng: -72.5175 }, zoom: 15 },
  { keywords: ["williams college", "williams"], coords: { lat: 42.7140, lng: -73.2028 }, zoom: 15 },
  // Pennsylvania
  { keywords: ["carnegie mellon", "cmu pittsburgh"], coords: { lat: 40.4433, lng: -79.9436 }, zoom: 15 },
  { keywords: ["university of pittsburgh", "pitt"], coords: { lat: 40.4444, lng: -79.9608 }, zoom: 15 },
  { keywords: ["penn state", "pennsylvania state", "psu"], coords: { lat: 40.7982, lng: -77.8599 }, zoom: 15 },
  { keywords: ["university of pennsylvania", "upenn", "penn philadelphia"], coords: { lat: 39.9522, lng: -75.1932 }, zoom: 15 },
  { keywords: ["drexel"], coords: { lat: 39.9566, lng: -75.1893 }, zoom: 15 },
  { keywords: ["temple university", "temple philadelphia"], coords: { lat: 39.9812, lng: -75.1554 }, zoom: 15 },
  { keywords: ["lehigh university", "lehigh bethlehem"], coords: { lat: 40.6065, lng: -75.3782 }, zoom: 15 },
  { keywords: ["villanova"], coords: { lat: 40.0351, lng: -75.3424 }, zoom: 15 },
  { keywords: ["swarthmore"], coords: { lat: 39.9051, lng: -75.3535 }, zoom: 15 },
  // North Carolina
  { keywords: ["unc", "university of north carolina", "chapel hill", "unc chapel hill"], coords: { lat: 35.9049, lng: -79.0469 }, zoom: 15 },
  { keywords: ["duke"], coords: { lat: 36.0014, lng: -78.9382 }, zoom: 15 },
  { keywords: ["nc state", "north carolina state", "ncsu raleigh"], coords: { lat: 35.7872, lng: -78.6822 }, zoom: 15 },
  { keywords: ["wake forest"], coords: { lat: 36.1318, lng: -80.2732 }, zoom: 15 },
  { keywords: ["davidson college", "davidson"], coords: { lat: 35.4993, lng: -80.8450 }, zoom: 15 },
  { keywords: ["elon university", "elon"], coords: { lat: 36.1021, lng: -79.5012 }, zoom: 15 },
  { keywords: ["appalachian state", "app state"], coords: { lat: 36.2150, lng: -81.6848 }, zoom: 15 },
  // Virginia
  { keywords: ["university of virginia", "uva", "charlottesville"], coords: { lat: 38.0336, lng: -78.5080 }, zoom: 15 },
  { keywords: ["virginia tech", "vt blacksburg", "hokies"], coords: { lat: 37.2284, lng: -80.4234 }, zoom: 15 },
  { keywords: ["george mason", "gmu fairfax"], coords: { lat: 38.8316, lng: -77.3117 }, zoom: 15 },
  { keywords: ["william and mary", "college of william"], coords: { lat: 37.2707, lng: -76.7075 }, zoom: 15 },
  { keywords: ["james madison", "jmu harrisonburg"], coords: { lat: 38.4365, lng: -78.8693 }, zoom: 15 },
  { keywords: ["virginia commonwealth", "vcu richmond"], coords: { lat: 37.5485, lng: -77.4536 }, zoom: 15 },
  { keywords: ["old dominion", "odu norfolk"], coords: { lat: 36.8860, lng: -76.3063 }, zoom: 15 },
  // Florida
  { keywords: ["university of florida", "uf gainesville", "gators"], coords: { lat: 29.6436, lng: -82.3549 }, zoom: 15 },
  { keywords: ["florida state", "fsu tallahassee", "seminoles"], coords: { lat: 30.4418, lng: -84.2985 }, zoom: 15 },
  { keywords: ["university of miami", "um coral gables"], coords: { lat: 25.7214, lng: -80.2792 }, zoom: 15 },
  { keywords: ["university of central florida", "ucf orlando"], coords: { lat: 28.6024, lng: -81.2001 }, zoom: 15 },
  { keywords: ["university of south florida", "usf tampa"], coords: { lat: 28.0587, lng: -82.4139 }, zoom: 15 },
  { keywords: ["florida international", "fiu miami"], coords: { lat: 25.7587, lng: -80.3736 }, zoom: 15 },
  { keywords: ["florida atlantic", "fau boca raton"], coords: { lat: 26.3701, lng: -80.1030 }, zoom: 15 },
  { keywords: ["miami dade college", "miami dade"], coords: { lat: 25.7732, lng: -80.1883 }, zoom: 14 },
  { keywords: ["nova southeastern", "nsu davie"], coords: { lat: 26.0546, lng: -80.2383 }, zoom: 15 },
  // Illinois
  { keywords: ["university of chicago", "uchicago"], coords: { lat: 41.7886, lng: -87.5987 }, zoom: 15 },
  { keywords: ["northwestern university", "northwestern evanston"], coords: { lat: 42.0565, lng: -87.6753 }, zoom: 15 },
  { keywords: ["university of illinois urbana", "uiuc", "illinois urbana champaign"], coords: { lat: 40.1020, lng: -88.2272 }, zoom: 15 },
  { keywords: ["university of illinois chicago", "uic"], coords: { lat: 41.8708, lng: -87.6494 }, zoom: 15 },
  { keywords: ["illinois state", "isu normal"], coords: { lat: 40.5142, lng: -88.9906 }, zoom: 15 },
  { keywords: ["depaul university", "depaul chicago"], coords: { lat: 41.9254, lng: -87.6553 }, zoom: 15 },
  { keywords: ["loyola university chicago", "loyola chicago"], coords: { lat: 41.9996, lng: -87.6584 }, zoom: 15 },
  // Michigan
  { keywords: ["university of michigan", "umich", "michigan ann arbor", "wolverines"], coords: { lat: 42.2780, lng: -83.7382 }, zoom: 15 },
  { keywords: ["michigan state", "msu east lansing", "spartans"], coords: { lat: 42.7018, lng: -84.4822 }, zoom: 15 },
  { keywords: ["wayne state", "wsu detroit"], coords: { lat: 42.3560, lng: -83.0726 }, zoom: 15 },
  { keywords: ["western michigan", "wmu kalamazoo"], coords: { lat: 42.2836, lng: -85.6145 }, zoom: 15 },
  { keywords: ["central michigan", "cmu mount pleasant"], coords: { lat: 43.5786, lng: -84.7745 }, zoom: 15 },
  { keywords: ["eastern michigan", "emu ypsilanti"], coords: { lat: 42.2514, lng: -83.6238 }, zoom: 15 },
  // Ohio
  { keywords: ["ohio state", "osu columbus", "buckeyes"], coords: { lat: 40.0076, lng: -83.0300 }, zoom: 15 },
  { keywords: ["case western", "cwru cleveland"], coords: { lat: 41.5042, lng: -81.6096 }, zoom: 15 },
  { keywords: ["university of cincinnati", "uc cincinnati"], coords: { lat: 39.1317, lng: -84.5167 }, zoom: 15 },
  { keywords: ["ohio university", "ohio athens"], coords: { lat: 39.3242, lng: -82.1013 }, zoom: 15 },
  { keywords: ["miami university ohio", "miami ohio"], coords: { lat: 39.5085, lng: -84.7436 }, zoom: 15 },
  { keywords: ["bowling green state", "bgsu"], coords: { lat: 41.3786, lng: -83.6523 }, zoom: 15 },
  { keywords: ["kent state", "kent ohio"], coords: { lat: 41.1536, lng: -81.3429 }, zoom: 15 },
  // Indiana
  { keywords: ["purdue", "purdue west lafayette"], coords: { lat: 40.4259, lng: -86.9081 }, zoom: 15 },
  { keywords: ["indiana university", "iu bloomington", "hoosiers"], coords: { lat: 39.1756, lng: -86.5130 }, zoom: 15 },
  { keywords: ["notre dame", "university of notre dame"], coords: { lat: 41.7052, lng: -86.2353 }, zoom: 15 },
  { keywords: ["butler university", "butler indianapolis"], coords: { lat: 39.8389, lng: -86.1718 }, zoom: 15 },
  { keywords: ["ball state", "bsu muncie"], coords: { lat: 40.2006, lng: -85.3919 }, zoom: 15 },
  // Wisconsin
  { keywords: ["university of wisconsin", "uw madison", "wisconsin madison", "badgers"], coords: { lat: 43.0766, lng: -89.4125 }, zoom: 15 },
  { keywords: ["marquette university", "marquette milwaukee"], coords: { lat: 43.0389, lng: -87.9362 }, zoom: 15 },
  // Minnesota
  { keywords: ["university of minnesota", "umn twin cities", "minnesota gophers"], coords: { lat: 44.9749, lng: -93.2350 }, zoom: 15 },
  { keywords: ["carleton college", "carleton northfield"], coords: { lat: 44.4600, lng: -93.1528 }, zoom: 15 },
  { keywords: ["st olaf college", "st olaf"], coords: { lat: 44.4654, lng: -93.1776 }, zoom: 15 },
  // Iowa
  { keywords: ["university of iowa", "iowa hawkeyes", "iowa city"], coords: { lat: 41.6612, lng: -91.5344 }, zoom: 15 },
  { keywords: ["iowa state", "isu ames"], coords: { lat: 42.0267, lng: -93.6465 }, zoom: 15 },
  { keywords: ["drake university", "drake des moines"], coords: { lat: 41.5985, lng: -93.6655 }, zoom: 15 },
  // Missouri
  { keywords: ["washington university st louis", "washu", "wustl"], coords: { lat: 38.6488, lng: -90.3108 }, zoom: 15 },
  { keywords: ["university of missouri", "mizzou", "mu columbia"], coords: { lat: 38.9517, lng: -92.3341 }, zoom: 15 },
  { keywords: ["saint louis university", "slu"], coords: { lat: 38.6371, lng: -90.2341 }, zoom: 15 },
  { keywords: ["truman state", "truman kirksville"], coords: { lat: 40.1886, lng: -92.5837 }, zoom: 15 },
  // Tennessee
  { keywords: ["vanderbilt university", "vanderbilt nashville"], coords: { lat: 36.1447, lng: -86.8027 }, zoom: 15 },
  { keywords: ["university of tennessee", "ut knoxville", "vols"], coords: { lat: 35.9544, lng: -83.9280 }, zoom: 15 },
  { keywords: ["tennessee state", "tsu nashville"], coords: { lat: 36.1677, lng: -86.8386 }, zoom: 15 },
  { keywords: ["belmont university", "belmont nashville"], coords: { lat: 36.1337, lng: -86.7954 }, zoom: 15 },
  { keywords: ["rhodes college", "rhodes memphis"], coords: { lat: 35.1501, lng: -90.0401 }, zoom: 15 },
  // South Carolina
  { keywords: ["university of south carolina", "usc columbia sc"], coords: { lat: 33.9963, lng: -81.0300 }, zoom: 15 },
  { keywords: ["clemson"], coords: { lat: 34.6834, lng: -82.8374 }, zoom: 15 },
  { keywords: ["furman university", "furman greenville"], coords: { lat: 34.9254, lng: -82.4440 }, zoom: 15 },
  // Alabama
  { keywords: ["university of alabama", "ua tuscaloosa", "crimson tide"], coords: { lat: 33.2148, lng: -87.5400 }, zoom: 15 },
  { keywords: ["auburn"], coords: { lat: 32.6015, lng: -85.4878 }, zoom: 15 },
  { keywords: ["alabama birmingham", "uab"], coords: { lat: 33.5035, lng: -86.8020 }, zoom: 15 },
  { keywords: ["samford university", "samford"], coords: { lat: 33.4648, lng: -86.7994 }, zoom: 15 },
  // Mississippi
  { keywords: ["ole miss", "university of mississippi", "mississippi oxford"], coords: { lat: 34.3651, lng: -89.5398 }, zoom: 15 },
  { keywords: ["mississippi state", "msu starkville"], coords: { lat: 33.4548, lng: -88.7895 }, zoom: 15 },
  // Arkansas
  { keywords: ["university of arkansas", "uark fayetteville", "razorbacks"], coords: { lat: 36.0682, lng: -94.1740 }, zoom: 15 },
  // Kentucky
  { keywords: ["university of kentucky", "uk lexington", "wildcats kentucky"], coords: { lat: 38.0305, lng: -84.5037 }, zoom: 15 },
  { keywords: ["louisville", "university of louisville", "ul louisville"], coords: { lat: 38.2122, lng: -85.7585 }, zoom: 15 },
  { keywords: ["transylvania university", "transylvania lexington"], coords: { lat: 38.0509, lng: -84.5060 }, zoom: 15 },
  // Louisiana
  { keywords: ["tulane"], coords: { lat: 29.9401, lng: -90.1213 }, zoom: 15 },
  { keywords: ["lsu", "louisiana state", "baton rouge"], coords: { lat: 30.4133, lng: -91.1800 }, zoom: 15 },
  { keywords: ["loyola new orleans", "loyola university new orleans"], coords: { lat: 29.9323, lng: -90.1206 }, zoom: 15 },
  { keywords: ["xavier university louisiana", "xula"], coords: { lat: 29.9597, lng: -90.1234 }, zoom: 15 },
  // Washington
  { keywords: ["university of washington", "uw seattle", "huskies washington"], coords: { lat: 47.6553, lng: -122.3035 }, zoom: 15 },
  { keywords: ["washington state", "wsu pullman", "cougars wsu"], coords: { lat: 46.7300, lng: -117.1548 }, zoom: 15 },
  { keywords: ["gonzaga", "gonzaga spokane"], coords: { lat: 47.6672, lng: -117.4022 }, zoom: 15 },
  { keywords: ["seattle university", "su seattle"], coords: { lat: 47.6061, lng: -122.3196 }, zoom: 15 },
  { keywords: ["western washington", "wwu bellingham"], coords: { lat: 48.7337, lng: -122.4875 }, zoom: 15 },
  // Oregon
  { keywords: ["university of oregon", "uo eugene", "ducks oregon"], coords: { lat: 44.0449, lng: -123.0729 }, zoom: 15 },
  { keywords: ["oregon state", "osu corvallis", "beavers osu"], coords: { lat: 44.5638, lng: -123.2794 }, zoom: 15 },
  { keywords: ["portland state", "psu portland"], coords: { lat: 45.5121, lng: -122.6834 }, zoom: 15 },
  { keywords: ["university of portland", "up portland"], coords: { lat: 45.5586, lng: -122.7125 }, zoom: 15 },
  // Colorado
  { keywords: ["university of colorado", "cu boulder", "colorado buffaloes"], coords: { lat: 40.0076, lng: -105.2659 }, zoom: 15 },
  { keywords: ["colorado state", "csu fort collins"], coords: { lat: 40.5734, lng: -105.0865 }, zoom: 15 },
  { keywords: ["university of denver", "du denver"], coords: { lat: 39.6786, lng: -104.9614 }, zoom: 15 },
  { keywords: ["colorado college", "cc colorado springs"], coords: { lat: 38.8519, lng: -104.8252 }, zoom: 15 },
  // Utah
  { keywords: ["university of utah", "uu salt lake", "utes"], coords: { lat: 40.7649, lng: -111.8421 }, zoom: 15 },
  { keywords: ["utah state", "usu logan"], coords: { lat: 41.7447, lng: -111.8097 }, zoom: 15 },
  { keywords: ["byu", "brigham young", "provo"], coords: { lat: 40.2518, lng: -111.6493 }, zoom: 15 },
  { keywords: ["weber state", "wsu ogden"], coords: { lat: 41.1945, lng: -111.9739 }, zoom: 15 },
  // Nevada
  { keywords: ["unlv", "university of nevada las vegas"], coords: { lat: 36.1075, lng: -115.1403 }, zoom: 15 },
  { keywords: ["university of nevada reno", "unr"], coords: { lat: 39.5453, lng: -119.8150 }, zoom: 15 },
  // Arizona
  { keywords: ["arizona state", "asu tempe", "sun devils"], coords: { lat: 33.4255, lng: -111.9400 }, zoom: 15 },
  { keywords: ["university of arizona", "uarizona", "wildcats tucson"], coords: { lat: 32.2319, lng: -110.9501 }, zoom: 15 },
  { keywords: ["northern arizona", "nau flagstaff"], coords: { lat: 35.1841, lng: -111.6557 }, zoom: 15 },
  // New Mexico
  { keywords: ["university of new mexico", "unm albuquerque"], coords: { lat: 35.0844, lng: -106.6198 }, zoom: 15 },
  { keywords: ["new mexico state", "nmsu las cruces"], coords: { lat: 32.2799, lng: -106.7487 }, zoom: 15 },
  // New Jersey
  { keywords: ["rutgers", "rutgers new brunswick"], coords: { lat: 40.5008, lng: -74.4474 }, zoom: 15 },
  { keywords: ["princeton"], coords: { lat: 40.3431, lng: -74.6551 }, zoom: 15 },
  { keywords: ["seton hall", "seton hall south orange"], coords: { lat: 40.7454, lng: -74.2437 }, zoom: 15 },
  { keywords: ["njit", "new jersey institute of technology"], coords: { lat: 40.7424, lng: -74.1780 }, zoom: 15 },
  { keywords: ["montclair state", "montclair"], coords: { lat: 40.8637, lng: -74.2001 }, zoom: 15 },
  // Connecticut
  { keywords: ["yale"], coords: { lat: 41.3163, lng: -72.9223 }, zoom: 15 },
  { keywords: ["university of connecticut", "uconn"], coords: { lat: 41.8076, lng: -72.2537 }, zoom: 15 },
  { keywords: ["wesleyan university", "wesleyan middletown"], coords: { lat: 41.5558, lng: -72.6588 }, zoom: 15 },
  { keywords: ["trinity college hartford", "trinity hartford"], coords: { lat: 41.7453, lng: -72.6920 }, zoom: 15 },
  // Maryland / DC
  { keywords: ["university of maryland", "umd college park", "terps"], coords: { lat: 38.9869, lng: -76.9426 }, zoom: 15 },
  { keywords: ["johns hopkins", "jhu baltimore"], coords: { lat: 39.3299, lng: -76.6205 }, zoom: 15 },
  { keywords: ["towson university", "towson"], coords: { lat: 39.3958, lng: -76.6000 }, zoom: 15 },
  { keywords: ["george washington", "gwu washington dc"], coords: { lat: 38.8993, lng: -77.0480 }, zoom: 15 },
  { keywords: ["georgetown"], coords: { lat: 38.9076, lng: -77.0723 }, zoom: 15 },
  { keywords: ["american university", "au washington dc"], coords: { lat: 38.9374, lng: -77.0869 }, zoom: 15 },
  { keywords: ["howard university", "howard hbcu"], coords: { lat: 38.9222, lng: -77.0199 }, zoom: 15 },
  { keywords: ["catholic university", "cua washington"], coords: { lat: 38.9341, lng: -76.9983 }, zoom: 15 },
  // Rhode Island
  { keywords: ["brown university", "brown providence"], coords: { lat: 41.8268, lng: -71.4025 }, zoom: 15 },
  { keywords: ["providence college", "pc providence"], coords: { lat: 41.8381, lng: -71.4362 }, zoom: 15 },
  { keywords: ["uri", "university of rhode island", "kingston ri"], coords: { lat: 41.4803, lng: -71.5272 }, zoom: 15 },
  // New Hampshire / Vermont / Maine
  { keywords: ["dartmouth"], coords: { lat: 43.7044, lng: -72.2887 }, zoom: 15 },
  { keywords: ["university of new hampshire", "unh durham"], coords: { lat: 43.1357, lng: -70.9364 }, zoom: 15 },
  { keywords: ["middlebury college", "middlebury vermont"], coords: { lat: 44.0088, lng: -73.1791 }, zoom: 15 },
  { keywords: ["university of vermont", "uvm burlington"], coords: { lat: 44.4775, lng: -73.1967 }, zoom: 15 },
  { keywords: ["bowdoin college", "bowdoin brunswick"], coords: { lat: 43.9069, lng: -69.9641 }, zoom: 15 },
  { keywords: ["bates college", "bates lewiston"], coords: { lat: 44.1056, lng: -70.2027 }, zoom: 15 },
  { keywords: ["colby college", "colby waterville"], coords: { lat: 44.5638, lng: -69.6627 }, zoom: 15 },
  { keywords: ["university of maine", "umaine orono"], coords: { lat: 44.9006, lng: -68.6674 }, zoom: 15 },
  // Kansas / Nebraska / Oklahoma
  { keywords: ["university of kansas", "ku lawrence", "jayhawks"], coords: { lat: 38.9543, lng: -95.2558 }, zoom: 15 },
  { keywords: ["kansas state", "ksu manhattan"], coords: { lat: 39.1836, lng: -96.5717 }, zoom: 15 },
  { keywords: ["university of nebraska", "unl lincoln", "cornhuskers"], coords: { lat: 40.8202, lng: -96.7005 }, zoom: 15 },
  { keywords: ["creighton", "creighton omaha"], coords: { lat: 41.2582, lng: -95.9810 }, zoom: 15 },
  { keywords: ["university of oklahoma", "ou norman", "sooners"], coords: { lat: 35.2059, lng: -97.4456 }, zoom: 15 },
  { keywords: ["oklahoma state", "osu stillwater"], coords: { lat: 36.1269, lng: -97.0682 }, zoom: 15 },
  { keywords: ["oral roberts university", "oru tulsa"], coords: { lat: 36.1540, lng: -95.9380 }, zoom: 15 },
  // HBCUs
  { keywords: ["hampton university", "hampton hbcu"], coords: { lat: 37.0249, lng: -76.3432 }, zoom: 15 },
  { keywords: ["norfolk state", "nsu norfolk"], coords: { lat: 36.8861, lng: -76.2946 }, zoom: 15 },
  { keywords: ["tuskegee university", "tuskegee"], coords: { lat: 32.4310, lng: -85.7107 }, zoom: 15 },
  { keywords: ["fisk university", "fisk nashville"], coords: { lat: 36.1699, lng: -86.8106 }, zoom: 15 },
  { keywords: ["prairie view a&m", "pvamu"], coords: { lat: 30.0899, lng: -95.9975 }, zoom: 15 },
  { keywords: ["grambling state", "grambling"], coords: { lat: 32.5268, lng: -92.7154 }, zoom: 15 },
  { keywords: ["southern university", "southern baton rouge", "subr"], coords: { lat: 30.5271, lng: -91.1763 }, zoom: 15 },
  { keywords: ["morgan state", "morgan state baltimore"], coords: { lat: 39.3424, lng: -76.5834 }, zoom: 15 },
  { keywords: ["bowie state", "bowie state university"], coords: { lat: 38.9488, lng: -76.7294 }, zoom: 15 },
  { keywords: ["north carolina a&t", "ncat greensboro"], coords: { lat: 36.0673, lng: -79.7700 }, zoom: 15 },
  { keywords: ["north carolina central", "nccu durham"], coords: { lat: 35.9770, lng: -78.9024 }, zoom: 15 },
  { keywords: ["florida a&m", "famu tallahassee"], coords: { lat: 30.4265, lng: -84.2877 }, zoom: 15 },
  { keywords: ["bethune cookman", "bethune-cookman daytona"], coords: { lat: 29.2161, lng: -81.0425 }, zoom: 15 },
  { keywords: ["jackson state", "jsu jackson ms"], coords: { lat: 32.2989, lng: -90.2095 }, zoom: 15 },
  { keywords: ["alcorn state", "alcorn lorman"], coords: { lat: 31.9579, lng: -90.9854 }, zoom: 15 },
  { keywords: ["dillard university", "dillard new orleans"], coords: { lat: 29.9946, lng: -90.0745 }, zoom: 15 },
  // International (bonus)
  { keywords: ["university of toronto", "u of t toronto", "uoft"], coords: { lat: 43.6629, lng: -79.3957 }, zoom: 15 },
  { keywords: ["mcgill", "mcgill montreal"], coords: { lat: 45.5048, lng: -73.5772 }, zoom: 15 },
  { keywords: ["ubc", "university of british columbia", "ubc vancouver"], coords: { lat: 49.2606, lng: -123.2460 }, zoom: 15 },
]

function findUniversityCoords(query: string) {
  const q = query.toLowerCase().trim()
  if (!q) return null
  for (const entry of UNIVERSITY_COORDS) {
    if (entry.keywords.some((kw) => q.includes(kw) || kw.includes(q))) {
      return entry
    }
  }
  return null
}

export function MapView() {
  const { data: properties = [], isLoading } = useProperties()
  const [filters, setFilters] = React.useState(defaultFilters)
  const [sort, setSort] = React.useState("newest")
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [showFullMap, setShowFullMap] = React.useState(false)
  const mapRef = React.useRef<google.maps.Map | null>(null)
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey ?? "",
  })

  // Pan map when university filter changes
  React.useEffect(() => {
    if (!mapRef.current) return
    const match = findUniversityCoords(filters.university)
    if (match) {
      mapRef.current.panTo(match.coords)
      mapRef.current.setZoom(match.zoom)
    }
  }, [filters.university])

  const filtered = properties.filter((property) => {
    if (
      filters.query &&
      !`${property.title} ${property.address} ${property.city}`
        .toLowerCase()
        .includes(filters.query.toLowerCase())
    )
      return false
    if (
      filters.university &&
      !(property.nearbyUniversity ?? "")
        .toLowerCase()
        .includes(filters.university.toLowerCase())
    )
      return false
    if (filters.type && property.type !== filters.type) return false
    if (filters.bedrooms && property.bedrooms < Number(filters.bedrooms)) return false
    if (filters.bathrooms && property.bathrooms < Number(filters.bathrooms)) return false
    if (property.price < filters.minPrice || property.price > filters.maxPrice) return false
    if (filters.furnished && !property.furnished) return false
    if (filters.pets && !property.petsAllowed) return false
    if (filters.parking && !property.parkingAvailable) return false
    if (
      filters.amenities.length &&
      !filters.amenities.every((a) => property.amenities.includes(a))
    )
      return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price
    if (sort === "price-desc") return b.price - a.price
    if (sort === "newest") return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
    return 0
  })

  const mapCenter =
    filtered[0]?.coordinates ?? properties[0]?.coordinates ?? { lat: 30.2849, lng: -97.7361 }

  const selected = filtered.find((p) => p.id === selectedId)

  const MapComponent = ({ height }: { height: string }) => (
    <div className={`overflow-hidden rounded-2xl border border-white/10 ${height}`}>
      {!apiKey ? (
        <div className="flex h-full items-center justify-center text-sm text-slate-400">
          Google Maps API key required.
        </div>
      ) : loadError ? (
        <div className="flex h-full items-center justify-center text-sm text-red-300">
          Failed to load map.
        </div>
      ) : !isLoaded ? (
        <div className="flex h-full items-center justify-center text-sm text-slate-400">
          Loading map...
        </div>
      ) : (
        <GoogleMap
          center={mapCenter}
          zoom={12}
          mapContainerClassName="h-full w-full"
          onLoad={(map) => { mapRef.current = map }}
          options={{
            clickableIcons: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          {filtered.map((property) => (
            <OverlayView
              key={property.id}
              position={property.coordinates}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <button
                onClick={() => {
                  setSelectedId(selectedId === property.id ? null : property.id)
                  if (!showFullMap) setShowFullMap(true)
                }}
                style={{ transform: "translate(-50%, -100%)", whiteSpace: "nowrap" }}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold shadow-lg transition-transform hover:scale-105 ${
                  selectedId === property.id
                    ? "bg-orange-400 text-slate-900"
                    : "bg-slate-900 text-white"
                }`}
              >
                ${property.price.toLocaleString()}/mo
              </button>
            </OverlayView>
          ))}
          {selected && showFullMap ? (
            <InfoWindow
              position={selected.coordinates}
              onCloseClick={() => setSelectedId(null)}
              options={{ pixelOffset: new (window as any).google.maps.Size(0, -40) }}
            >
              <div className="w-56 overflow-hidden rounded-xl">
                <img
                  src={selected.images[0] ?? defaultImage}
                  alt={selected.title}
                  className="h-32 w-full object-cover"
                />
                <div className="space-y-1.5 p-3">
                  <p className="text-sm font-semibold leading-tight text-slate-900">
                    {selected.title}
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    ${selected.price.toLocaleString()}/mo
                  </p>
                  <div className="flex gap-3 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Bed size={12} /> {selected.bedrooms} Bed
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath size={12} /> {selected.bathrooms} Bath
                    </span>
                  </div>
                  <Link
                    to={`/properties/${selected.id}`}
                    className="mt-2 block rounded-lg bg-slate-900 px-3 py-1.5 text-center text-xs font-semibold text-white hover:bg-slate-700"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </InfoWindow>
          ) : null}
        </GoogleMap>
      )}
    </div>
  )

  // Full screen map mode
  if (showFullMap) {
    return (
      <div className="fixed inset-0 z-50 flex bg-slate-950">
        <button
          onClick={() => { setShowFullMap(false); setSelectedId(null) }}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg hover:bg-slate-700"
        >
          <X size={18} />
        </button>

        <div className="absolute left-4 top-4 z-10 rounded-xl bg-slate-900/90 px-3 py-2 text-sm font-semibold text-white shadow">
          {filtered.length} listing{filtered.length !== 1 ? "s" : ""} found
        </div>

        <div className="flex-1">
          <MapComponent height="h-full" />
        </div>

        <div className="hidden w-80 flex-shrink-0 overflow-y-auto border-l border-white/10 bg-slate-950 p-4 lg:block">
          <div className="space-y-3">
            {filtered.map((property) => (
              <button
                key={property.id}
                onClick={() => setSelectedId(selectedId === property.id ? null : property.id)}
                className={`w-full overflow-hidden rounded-2xl border text-left transition ${
                  selectedId === property.id
                    ? "border-orange-400/60 bg-orange-400/10"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <img
                  src={property.images[0] ?? defaultImage}
                  alt={property.title}
                  className="h-28 w-full object-cover"
                />
                <div className="space-y-1 p-3">
                  <p className="line-clamp-1 text-sm font-semibold text-white">
                    {property.title}
                  </p>
                  <p className="text-xs text-slate-400">{property.city}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-orange-300">
                      ${property.price.toLocaleString()}/mo
                    </span>
                    <span className="text-xs text-slate-400">
                      {property.bedrooms}bd · {property.bathrooms}ba
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
              <p className="text-sm font-semibold text-white">No listings available</p>
              <p className="mt-1 text-xs">Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Listings" }]} />

      {/* Map */}
      <div className="relative">
        <MapComponent height="h-64" />
        <button
          onClick={() => setShowFullMap(true)}
          className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-900/30 transition hover:bg-slate-900/40"
        >
          <span className="flex items-center gap-2 rounded-lg bg-slate-900/90 px-4 py-2 text-sm font-semibold text-white shadow">
            <MapPin size={14} />
            Show on map
          </span>
        </button>
      </div>

      {/* Filters */}
      <PropertyFilters value={filters} onChange={setFilters} />

      {/* Count + Sort */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-300">
          <span className="font-semibold text-white">{filtered.length}</span> listings found
        </p>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="h-9 rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white"
        >
          <option value="newest">Newest first</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      {/* Listing cards */}
      {isLoading ? (
        <PropertyGridSkeleton />
      ) : (
        <motion.div layout className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {sorted.map((property) => (
            <motion.div
              key={property.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PropertyCard property={property} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-lg font-semibold text-white">No results found</p>
          <p className="mt-2 text-sm text-slate-400">
            Try adjusting your filters or clearing them to see more listings.
          </p>
        </div>
      )}

      <CompareBar properties={properties} />
    </div>
  )
}
