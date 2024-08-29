import { VideoReading } from "../../videoReadings/VideoReading";
import './video.scss';

const videoReading = new VideoReading(document.getElementById("video"), document.getElementById("learning"));
videoReading.start();