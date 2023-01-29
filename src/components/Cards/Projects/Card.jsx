import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';

const ProjectCard = React.memo(({name, description, gitHub, site, id, image}) => {

  return (
    <Card sx={{
      width: 300,
      height: 300,
      boxShadow: '0 8px 32px 0 rgba( 0, 0, 0, 0.37 )',
      backgroundColor: '#F6F4F3',
      backdropFilter: 'blur( 4px )',
      borderRadius: '10px',
      border: '1px solid rgba( 255, 255, 255, 0.18 )',
      }}
      id={id}
      >
      <CardMedia
        sx={{ height: 150 }}
        image={image}
        title={name}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
      <CardActions>
        <a href={ gitHub } target="_blank" rel="noopener noreferrer"><Button size="small">Git Hub</Button></a>
        {
          site
          ? <a href={ site } target="_blank" rel="noopener noreferrer"><Button size="small">Site</Button></a>
          : null
        }
      </CardActions>
    </Card>
  );
})

ProjectCard.propTypes = {
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  gitHub: PropTypes.string.isRequired,
  site: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
}

export default ProjectCard;
