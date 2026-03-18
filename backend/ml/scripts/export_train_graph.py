import tensorflow as tf
import os

def build_gatys_graph():
    """
    Builds a TensorFlow graph for Neural Style Transfer (Gatys method).
    Since Go doesn't support AutoGrad natively, we export a pre-built
    optimization step as a SavedModel.
    """
    print("Building Gatys training graph...")
    
    # 1. Load VGG19 (or InceptionV3) without top layers
    # For Gatys, VGG19 is standard, but keeping consistent with project specs
    vgg = tf.keras.applications.InceptionV3(include_top=False, weights='imagenet')
    vgg.trainable = False
    
    # Define layers for content and style
    content_layers = ['mixed6']
    style_layers = ['mixed0', 'mixed1', 'mixed2', 'mixed3', 'mixed4']
    
    outputs = [vgg.get_layer(name).output for name in (style_layers + content_layers)]
    feature_extractor = tf.keras.Model([vgg.input], outputs)
    
    @tf.function(input_signature=[
        tf.TensorSpec(shape=[1, None, None, 3], dtype=tf.float32, name="input_image"),
        tf.TensorSpec(shape=[1, None, None, 3], dtype=tf.float32, name="content_target"),
        tf.TensorSpec(shape=[1, None, None, 3], dtype=tf.float32, name="style_target"),
        tf.TensorSpec(shape=[], dtype=tf.float32, name="content_weight"),
        tf.TensorSpec(shape=[], dtype=tf.float32, name="style_weight"),
        tf.TensorSpec(shape=[], dtype=tf.float32, name="learning_rate"),
    ])
    def train_step(input_image, content_target, style_target, content_weight, style_weight, learning_rate):
        # NOTE: In a true graph export for Go, we'd need to maintain state (Variable) 
        # or pass the image back and forth. Passing back and forth is easier for Go to control.
        # However, Keras optimizers expect Variables.
        # For a truly stateless update from Go, we calculate gradients and apply them manually here.
        
        with tf.GradientTape() as tape:
            tape.watch(input_image)
            
            # Preprocess inputs for InceptionV3 (expects -1 to 1)
            # Assuming inputs are 0-255 float32
            prep_input = tf.keras.applications.inception_v3.preprocess_input(input_image)
            prep_content = tf.keras.applications.inception_v3.preprocess_input(content_target)
            prep_style = tf.keras.applications.inception_v3.preprocess_input(style_target)
            
            # Extract features
            input_features = feature_extractor(prep_input)
            content_features = feature_extractor(prep_content)
            style_features = feature_extractor(prep_style)
            
            # Compute Content Loss
            content_loss = tf.reduce_mean(tf.square(input_features[-1] - content_features[-1]))
            
            # Compute Style Loss
            style_loss = tf.constant(0.0)
            for i in range(len(style_layers)):
                gram_input = gram_matrix(input_features[i])
                gram_style = gram_matrix(style_features[i])
                layer_loss = tf.reduce_mean(tf.square(gram_input - gram_style))
                style_loss += layer_loss
            style_loss /= float(len(style_layers))
            
            # Total Loss
            total_loss = (content_weight * content_loss) + (style_weight * style_loss)
            
        # Calculate gradients
        gradients = tape.gradient(total_loss, input_image)
        
        # Apply strict gradient descent update (Go manages the loop)
        # Note: Adam optimizer state is hard to pass back and forth efficiently,
        # so we use basic SGD here, or Go can manage Adam state if we return raw gradients.
        updated_image = input_image - (learning_rate * gradients)
        
        # Clip to valid 0-255 range
        updated_image = tf.clip_by_value(updated_image, 0.0, 255.0)
        
        return {
            "updated_image": updated_image,
            "content_loss": content_loss,
            "style_loss": style_loss,
            "total_loss": total_loss,
            "gradients": gradients
        }

    return train_step

def gram_matrix(input_tensor):
    result = tf.linalg.einsum('bijc,bijd->bcd', input_tensor, input_tensor)
    input_shape = tf.shape(input_tensor)
    num_locations = tf.cast(input_shape[1]*input_shape[2], tf.float32)
    return result / num_locations

class GatysModel(tf.Module):
    def __init__(self):
        super(GatysModel, self).__init__()
        self.train_step = build_gatys_graph()
        
    @tf.function
    def __call__(self, input_image, content_target, style_target, content_weight, style_weight, learning_rate):
        return self.train_step(input_image, content_target, style_target, content_weight, style_weight, learning_rate)

if __name__ == "__main__":
    export_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'gatys_optimizer')
    model = GatysModel()
    
    print(f"Exporting model to {export_path}...")
    tf.saved_model.save(
        model, 
        export_path,
        signatures={'train_step': model.__call__.get_concrete_function(
            tf.TensorSpec(shape=[1, None, None, 3], dtype=tf.float32, name="input_image"),
            tf.TensorSpec(shape=[1, None, None, 3], dtype=tf.float32, name="content_target"),
            tf.TensorSpec(shape=[1, None, None, 3], dtype=tf.float32, name="style_target"),
            tf.TensorSpec(shape=[], dtype=tf.float32, name="content_weight"),
            tf.TensorSpec(shape=[], dtype=tf.float32, name="style_weight"),
            tf.TensorSpec(shape=[], dtype=tf.float32, name="learning_rate")
        )}
    )
    print("Export complete.")
